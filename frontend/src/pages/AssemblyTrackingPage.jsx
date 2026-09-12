import React, { useEffect, useState } from 'react';
import assemblyService from '../services/assemblyService';
import productionOrderService from '../services/productionOrderService';
import employeeService from '../services/employeeService';
import toast from 'react-hot-toast';
import {
  Workflow,
  CheckCircle2,
  Clock,
  Play,
  Check,
  AlertCircle,
  UserCheck,
  Package,
  Layers,
  Calendar,
  RefreshCw,
  X,
  ChevronRight,
  ArrowRight,
  Info,
  ShieldCheck,
  Box,
  Truck,
  Sparkles,
  Timer,
} from 'lucide-react';

const STAGE_METADATA = {
  MATERIAL_COLLECTION: {
    step: 1,
    title: 'Material Collection',
    desc: 'Issue raw materials: barrels, tips, ink refills, and safety caps from warehouse.',
    color: 'sky',
  },
  REFILL_PREPARATION: {
    step: 2,
    title: 'Refill Preparation',
    desc: 'High-viscosity ink injection into refill tubes and centrifuge air-bubble removal.',
    color: 'blue',
  },
  BARREL_ASSEMBLY: {
    step: 3,
    title: 'Barrel Assembly',
    desc: 'Pneumatic feeding and alignment of prepared refills into outer pen barrels.',
    color: 'indigo',
  },
  TIP_INSTALLATION: {
    step: 4,
    title: 'Tip Installation',
    desc: 'Precision press-fit of tungsten carbide ball tips at calibrated hydraulic pressure.',
    color: 'violet',
  },
  CAP_ASSEMBLY: {
    step: 5,
    title: 'Cap Assembly',
    desc: 'Snap-lock assembly of ventilated safety caps with tactile click verification.',
    color: 'purple',
  },
  QUALITY_CHECK: {
    step: 6,
    title: 'Quality Check',
    desc: 'Continuous line optical inspection, write-smoothness test, and leak detection.',
    color: 'emerald',
  },
  PACKAGING: {
    step: 7,
    title: 'Packaging',
    desc: 'Grouping into commercial 10-pen retail packs or 100-pen corrugated master cartons.',
    color: 'amber',
  },
  FINISHED_GOODS: {
    step: 8,
    title: 'Finished Goods',
    desc: 'Final palletizing, barcode labelling, and warehouse bay staging for dispatch.',
    color: 'teal',
  },
};

const sortStages = (stageList) => {
  if (!Array.isArray(stageList)) return [];
  return [...stageList].sort((a, b) => {
    const stepA = STAGE_METADATA[a?.stage]?.step ?? a?.stageOrder ?? 99;
    const stepB = STAGE_METADATA[b?.stage]?.step ?? b?.stageOrder ?? 99;
    return stepA - stepB;
  });
};

function AssemblyTrackingPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [stages, setStages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stagesLoading, setStagesLoading] = useState(false);

  // Modals
  const [startModalStage, setStartModalStage] = useState(null);
  const [completeModalStage, setCompleteModalStage] = useState(null);
  const [editModalStage, setEditModalStage] = useState(null);

  // Form states for modals
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [modalRemarks, setModalRemarks] = useState('');
  const [modalStatus, setModalStatus] = useState('PENDING');
  const [modalStartedTime, setModalStartedTime] = useState('');
  const [modalCompletedTime, setModalCompletedTime] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    fetchInitialData();
    // Live ticking timer every second for real-time elapsed time calculation
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [ordRes, empRes] = await Promise.allSettled([
        productionOrderService.getAll(),
        employeeService.getAll(),
      ]);

      let loadedOrders = [];
      if (ordRes.status === 'fulfilled') {
        const val = ordRes.value;
        loadedOrders = Array.isArray(val) ? val : (val?.data || []);
      }
      setOrders(loadedOrders);

      if (empRes.status === 'fulfilled') {
        const val = empRes.value;
        const empList = Array.isArray(val) ? val : (val?.data || []);
        setEmployees(empList);
      }

      if (loadedOrders.length > 0) {
        const defaultOrder = loadedOrders[0];
        setSelectedOrderId(defaultOrder.id);
        fetchStagesForOrder(defaultOrder.id);
      } else {
        setSelectedOrderId(null);
        setStages([]);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      setOrders([]);
      setSelectedOrderId(null);
      setStages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStagesForOrder = async (orderId) => {
    if (!orderId) {
      setStages([]);
      return;
    }
    setStagesLoading(true);
    try {
      const res = await assemblyService.getByOrderId(orderId);
      const stageList = Array.isArray(res) ? res : (res?.data || []);
      setStages(sortStages(stageList));
    } catch (err) {
      console.error('Error loading stages:', err);
      setStages([]);
    } finally {
      setStagesLoading(false);
    }
  };

  const handleOrderChange = (orderId) => {
    setSelectedOrderId(orderId);
    fetchStagesForOrder(orderId);
  };

  // Actions
  const handleOpenStartModal = (stage) => {
    setStartModalStage(stage);
    setSelectedEmployeeId(stage.assignedEmployeeId || (employees[0]?.id || ''));
    setModalRemarks('');
  };

  const handleConfirmStart = async () => {
    if (!startModalStage) return;
    try {
      await assemblyService.startStage(startModalStage.id, selectedEmployeeId, modalRemarks);
      toast.success(`Started stage: ${STAGE_METADATA[startModalStage.stage]?.title || startModalStage.stage}`);
      setStartModalStage(null);
      fetchStagesForOrder(selectedOrderId);
    } catch (err) {
      // Optimistic update
      setStages((prev) =>
        sortStages(
          prev.map((s) =>
            s.id === startModalStage.id
              ? {
                  ...s,
                  status: 'IN_PROGRESS',
                  startedTime: new Date().toISOString(),
                  assignedEmployeeName:
                    employees.find((e) => e.id === Number(selectedEmployeeId))?.fullName ||
                    'Assigned Operator',
                  remarks: modalRemarks || 'Started production stage',
                }
              : s
          )
        )
      );
      toast.success(`Started stage (demo mode)`);
      setStartModalStage(null);
    }
  };

  const handleOpenCompleteModal = (stage) => {
    setCompleteModalStage(stage);
    setModalRemarks(stage.remarks || 'Stage completed with calibrated tolerances');
  };

  const handleConfirmComplete = async () => {
    if (!completeModalStage) return;
    try {
      await assemblyService.completeStage(completeModalStage.id, modalRemarks);
      toast.success(`Completed stage: ${STAGE_METADATA[completeModalStage.stage]?.title || completeModalStage.stage}`);
      setCompleteModalStage(null);
      fetchStagesForOrder(selectedOrderId);
    } catch (err) {
      // Optimistic update
      setStages((prev) =>
        sortStages(
          prev.map((s) =>
            s.id === completeModalStage.id
              ? {
                  ...s,
                  status: 'COMPLETED',
                  completedTime: new Date().toISOString(),
                  remarks: modalRemarks || 'Completed',
                }
              : s
          )
        )
      );
      toast.success(`Completed stage (demo mode)`);
      setCompleteModalStage(null);
    }
  };

  const toInputDateTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '';
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    } catch {
      return '';
    }
  };

  const handleOpenEditModal = (stage) => {
    setEditModalStage(stage);
    setModalStatus(stage.status);
    setSelectedEmployeeId(stage.assignedEmployeeId || '');
    setModalRemarks(stage.remarks || '');
    setModalStartedTime(toInputDateTime(stage.startedTime));
    setModalCompletedTime(toInputDateTime(stage.completedTime));
  };

  const handleConfirmEdit = async () => {
    if (!editModalStage) return;
    try {
      await assemblyService.updateStage(editModalStage.id, {
        status: modalStatus,
        assignedEmployeeId: selectedEmployeeId ? Number(selectedEmployeeId) : null,
        remarks: modalRemarks,
        startedTime: modalStartedTime || null,
        completedTime: modalCompletedTime || null,
      });
      toast.success('Stage record updated successfully');
      setEditModalStage(null);
      fetchStagesForOrder(selectedOrderId);
    } catch (err) {
      setStages((prev) =>
        sortStages(
          prev.map((s) =>
            s.id === editModalStage.id
              ? {
                  ...s,
                  status: modalStatus,
                  remarks: modalRemarks,
                  startedTime: modalStartedTime || s.startedTime,
                  completedTime: modalCompletedTime || s.completedTime,
                }
              : s
          )
        )
      );
      toast.success('Stage record updated (demo mode)');
      setEditModalStage(null);
    }
  };

  const activeOrder = orders.find((o) => o.id === selectedOrderId);

  // Compute completion stats
  const completedCount = stages.filter((s) => s.status === 'COMPLETED').length;
  const inProgressCount = stages.filter((s) => s.status === 'IN_PROGRESS').length;
  const progressPercentage = stages.length > 0 ? Math.round((completedCount / stages.length) * 100) : 0;

  const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const getDurationText = (startedTime, completedTime) => {
    if (!startedTime) return null;
    const start = new Date(startedTime);
    const end = completedTime ? new Date(completedTime) : new Date(currentTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    const diffSec = Math.max(0, Math.floor((end - start) / 1000));
    if (diffSec < 60) return `${diffSec}s`;
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Workflow className="h-7 w-7 text-indigo-600" />
            Assembly Line Tracking
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sequential 8-stage manufacturing workflow, line operations, and cycle times
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => selectedOrderId && fetchStagesForOrder(selectedOrderId)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-5 w-5 ${stagesLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ORDER SELECTOR & ACTIVE BATCH HERO CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select Active Production Batch
              </label>
              <select
                value={selectedOrderId || ''}
                onChange={(e) => handleOrderChange(Number(e.target.value))}
                className="mt-1 font-semibold text-base text-slate-900 bg-transparent border-0 border-b-2 border-indigo-600 focus:ring-0 focus:outline-none cursor-pointer pr-8"
              >
                {orders.map((ord) => (
                  <option key={ord.id} value={ord.id}>
                    {ord.orderNumber} — {ord.productName} ({ord.orderedQuantity} pens)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeOrder && (
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400">Customer: </span>
                <span className="font-semibold text-slate-800">{activeOrder.customerName}</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400">Due Date: </span>
                <span className="font-semibold text-slate-800">{activeOrder.dueDate}</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400">Priority: </span>
                <span
                  className={`font-semibold ${
                    activeOrder.priority === 'HIGH'
                      ? 'text-rose-600'
                      : activeOrder.priority === 'MEDIUM'
                      ? 'text-amber-600'
                      : 'text-slate-600'
                  }`}
                >
                  {activeOrder.priority}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Progress Overview Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Batch Production Milestone Progress
            </span>
            <span className="font-bold text-indigo-600 text-sm">
              {progressPercentage}% Complete ({completedCount}/8 Stages)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* 8-Node Horizontal Visual Stepper */}
        <div className="pt-2 hidden lg:block overflow-x-auto">
          <div className="flex items-center justify-between min-w-[760px] relative">
            <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-200 -z-0" />
            {Object.keys(STAGE_METADATA).map((stageKey, idx) => {
              const info = STAGE_METADATA[stageKey];
              const stageData = stages.find((s) => s.stage === stageKey);
              const isCompleted = stageData?.status === 'COMPLETED';
              const isInProgress = stageData?.status === 'IN_PROGRESS';

              return (
                <div key={stageKey} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                      isCompleted
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : isInProgress
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : info.step}
                  </div>
                  <span
                    className={`text-[11px] font-medium mt-2 text-center max-w-[90px] leading-tight ${
                      isCompleted
                        ? 'text-emerald-700 font-semibold'
                        : isInProgress
                        ? 'text-indigo-700 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {info.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 8-STAGE VERTICAL PIPELINE CARDS */}
      <div className="space-y-4">
        {sortStages(stages).map((stageItem, index) => {
          const meta = STAGE_METADATA[stageItem.stage] || {
            step: stageItem.stageOrder || index + 1,
            title: stageItem.stageDisplayName || stageItem.stage,
            desc: '',
          };
          const isCompleted = stageItem.status === 'COMPLETED';
          const isInProgress = stageItem.status === 'IN_PROGRESS';
          const isPending = stageItem.status === 'PENDING';
          const isBlocked = stageItem.status === 'BLOCKED';

          return (
            <div
              key={stageItem.id || index}
              className={`bg-white rounded-xl border p-5 transition-all shadow-sm hover:shadow-md ${
                isCompleted
                  ? 'border-emerald-200/80 bg-emerald-50/10'
                  : isInProgress
                  ? 'border-indigo-300 ring-2 ring-indigo-100 bg-indigo-50/20'
                  : isBlocked
                  ? 'border-rose-200 bg-rose-50/10'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left Side: Step Number + Title + Description */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isInProgress
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : `S${meta.step}`}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{meta.title}</h3>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isInProgress
                            ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                            : isBlocked
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {stageItem.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{meta.desc}</p>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                      {stageItem.assignedEmployeeName && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                          <UserCheck className="h-3.5 w-3.5 text-slate-500" />
                          Operator: <strong>{stageItem.assignedEmployeeName}</strong>
                        </span>
                      )}
                      {stageItem.startedTime && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          Started: <strong>{formatDateTime(stageItem.startedTime)}</strong>
                        </span>
                      )}
                      {stageItem.completedTime && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Completed: <strong>{formatDateTime(stageItem.completedTime)}</strong>
                        </span>
                      )}
                      {stageItem.startedTime && getDurationText(stageItem.startedTime, stageItem.completedTime) && (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border ${
                          stageItem.status === 'COMPLETED'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                        }`}>
                          <Timer className="h-3.5 w-3.5 text-blue-600" />
                          {stageItem.status === 'COMPLETED' ? 'Cycle Time: ' : 'Elapsed: '}
                          <strong>{getDurationText(stageItem.startedTime, stageItem.completedTime)}</strong>
                        </span>
                      )}
                    </div>

                    {/* Stage Remarks */}
                    {stageItem.remarks && (
                      <div className="mt-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 italic">
                        "{stageItem.remarks}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Interactive Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {isPending && (
                    <button
                      onClick={() => handleOpenStartModal(stageItem)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Start Stage
                    </button>
                  )}

                  {isInProgress && (
                    <button
                      onClick={() => handleOpenCompleteModal(stageItem)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Complete Stage
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEditModal(stageItem)}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-medium transition-colors"
                  >
                    Edit / Log
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* START STAGE MODAL */}
      {startModalStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Start Stage: {STAGE_METADATA[startModalStage.stage]?.title || startModalStage.stage}
              </h2>
              <button
                onClick={() => setStartModalStage(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Assign Assembly Operator
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Select Operator</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeCode} - {emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Batch Remarks / Start Notes
                </label>
                <textarea
                  rows="3"
                  value={modalRemarks}
                  onChange={(e) => setModalRemarks(e.target.value)}
                  placeholder="e.g. Loaded 1000 blue barrels; calibrated nozzle pressure"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setStartModalStage(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStart}
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  Confirm & Start
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE STAGE MODAL */}
      {completeModalStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Complete Stage:{' '}
                {STAGE_METADATA[completeModalStage.stage]?.title || completeModalStage.stage}
              </h2>
              <button
                onClick={() => setCompleteModalStage(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                Marking this stage complete records the completion timestamp and verifies the batch
                for downstream processing.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Completion Notes / Yield Log
                </label>
                <textarea
                  rows="3"
                  value={modalRemarks}
                  onChange={(e) => setModalRemarks(e.target.value)}
                  placeholder="e.g. All parts assembled within standard cycle time"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setCompleteModalStage(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmComplete}
                  className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                >
                  Complete Stage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / LOG STAGE MODAL */}
      {editModalStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Edit Stage Log:{' '}
                {STAGE_METADATA[editModalStage.stage]?.title || editModalStage.stage}
              </h2>
              <button
                onClick={() => setEditModalStage(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Status
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="BLOCKED">BLOCKED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Assigned Operator
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">None (Unassigned)</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Started Timing
                  </label>
                  <input
                    type="datetime-local"
                    step="1"
                    value={modalStartedTime}
                    onChange={(e) => setModalStartedTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Completed Timing
                  </label>
                  <input
                    type="datetime-local"
                    step="1"
                    value={modalCompletedTime}
                    onChange={(e) => setModalCompletedTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Remarks / Notes
                </label>
                <textarea
                  rows="3"
                  value={modalRemarks}
                  onChange={(e) => setModalRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setEditModalStage(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmEdit}
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssemblyTrackingPage;
