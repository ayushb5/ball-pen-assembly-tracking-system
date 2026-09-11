import React, { useEffect, useState } from 'react';
import workstationService from '../services/workstationService';
import employeeService from '../services/employeeService';
import productionOrderService from '../services/productionOrderService';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {
  Cpu,
  Plus,
  Search,
  Edit2,
  Trash2,
  UserCheck,
  Package,
  Activity,
  AlertTriangle,
  Power,
  RefreshCw,
  X,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle,
  Wrench,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const STATION_TYPES = [
  'Material Collection',
  'Refill Preparation',
  'Barrel Assembly',
  'Tip Installation',
  'Cap Assembly',
  'Quality Check',
  'Packaging',
  'General Line',
];

function WorkstationsPage() {
  const [workstations, setWorkstations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wsRes, empRes, ordRes] = await Promise.allSettled([
        workstationService.getAll(),
        employeeService.getAll(),
        productionOrderService.getAll(),
      ]);

      if (wsRes.status === 'fulfilled') {
        const val = wsRes.value;
        const list = Array.isArray(val) ? val : (val?.data || []);
        setWorkstations(list);
      }

      if (empRes.status === 'fulfilled') {
        const val = empRes.value;
        const list = Array.isArray(val) ? val : (val?.data || []);
        setEmployees(list);
      }

      if (ordRes.status === 'fulfilled') {
        const val = ordRes.value;
        const list = Array.isArray(val) ? val : (val?.data || []);
        setOrders(list);
      }
    } catch (err) {
      console.error('Failed to load workstation data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Formik validation for Create / Edit
  const validationSchema = Yup.object({
    stationCode: Yup.string()
      .required('Workstation code is required')
      .max(20, 'Maximum 20 characters'),
    stationName: Yup.string()
      .required('Station name is required')
      .max(100, 'Maximum 100 characters'),
    stationType: Yup.string().required('Station type is required'),
    status: Yup.string().required('Status is required'),
  });

  const formik = useFormik({
    initialValues: {
      stationCode: '',
      stationName: '',
      stationType: 'Material Collection',
      assignedEmployeeId: '',
      currentOrderId: '',
      status: 'IDLE',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = {
          ...values,
          assignedEmployeeId: values.assignedEmployeeId ? Number(values.assignedEmployeeId) : null,
          currentOrderId: values.currentOrderId ? Number(values.currentOrderId) : null,
        };

        if (selectedStation && !isAssignModalOpen) {
          await workstationService.update(selectedStation.id, payload);
          toast.success(`Workstation ${payload.stationCode} updated successfully`);
        } else {
          await workstationService.create(payload);
          toast.success(`Workstation ${payload.stationCode} registered successfully`);
        }
        setIsFormModalOpen(false);
        setSelectedStation(null);
        resetForm();
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Operation failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Handle Quick Status Change
  const handleStatusChange = async (stationId, newStatus) => {
    try {
      await workstationService.updateStatus(stationId, newStatus);
      toast.success(`Station status updated to ${newStatus}`);
      fetchData();
    } catch (err) {
      // Local optimistic fallback
      setWorkstations((prev) =>
        prev.map((ws) => (ws.id === stationId ? { ...ws, status: newStatus } : ws))
      );
      toast.success(`Station status updated to ${newStatus} (demo mode)`);
    }
  };

  // Quick Operator & Order Assignment Formik
  const assignFormik = useFormik({
    initialValues: {
      employeeId: '',
      orderId: '',
    },
    onSubmit: async (values, { setSubmitting }) => {
      if (!selectedStation) return;
      try {
        const payload = {
          employeeId: values.employeeId ? Number(values.employeeId) : null,
          orderId: values.orderId ? Number(values.orderId) : null,
        };
        await workstationService.assign(selectedStation.id, payload);
        toast.success(`Workstation ${selectedStation.stationCode} assignment updated`);
        setIsAssignModalOpen(false);
        setSelectedStation(null);
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Assignment failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const openEditModal = (station) => {
    setSelectedStation(station);
    formik.setValues({
      stationCode: station.stationCode,
      stationName: station.stationName,
      stationType: station.stationType,
      assignedEmployeeId: station.assignedEmployeeId || '',
      currentOrderId: station.currentOrderId || '',
      status: station.status,
    });
    setIsFormModalOpen(true);
  };

  const openAssignModal = (station) => {
    setSelectedStation(station);
    assignFormik.setValues({
      employeeId: station.assignedEmployeeId || '',
      orderId: station.currentOrderId || '',
    });
    setIsAssignModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedStation(null);
    formik.resetForm();
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (station) => {
    setSelectedStation(station);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedStation) return;
    try {
      await workstationService.delete(selectedStation.id);
      toast.success(`Workstation ${selectedStation.stationCode} removed`);
      setIsDeleteModalOpen(false);
      setSelectedStation(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete workstation');
    }
  };

  // Filtered List
  const filteredWorkstations = workstations.filter((ws) => {
    const matchesSearch =
      ws.stationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ws.stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ws.assignedEmployeeName &&
        ws.assignedEmployeeName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || ws.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || ws.stationType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // KPI Calculations
  const totalStations = workstations.length;
  const runningStations = workstations.filter((w) => w.status === 'RUNNING').length;
  const idleStations = workstations.filter((w) => w.status === 'IDLE').length;
  const maintenanceStations = workstations.filter(
    (w) => w.status === 'MAINTENANCE' || w.status === 'OFFLINE'
  ).length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Running
          </span>
        );
      case 'IDLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            Idle
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <Wrench className="h-3 w-3 text-orange-500" />
            Maintenance
          </span>
        );
      case 'OFFLINE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <Power className="h-3 w-3 text-slate-400" />
            Offline
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="h-7 w-7 text-indigo-600" />
            Workstations Monitoring
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time shop-floor cells, machine operational states, and operator allocations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Workstation
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Stations
            </span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Cpu className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalStations}</div>
          <div className="text-xs text-slate-500 mt-1">Configured assembly cells</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Active / Running
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Activity className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{runningStations}</div>
          <div className="text-xs text-slate-500 mt-1">Live batch assembly in progress</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Idle / Standby
            </span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <CheckCircle className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{idleStations}</div>
          <div className="text-xs text-slate-500 mt-1">Awaiting batch loading</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-600">
              Maintenance / Offline
            </span>
            <span className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Wrench className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-orange-700 mt-2">{maintenanceStations}</div>
          <div className="text-xs text-slate-500 mt-1">Tooling or scheduled service</div>
        </div>
      </div>

      {/* Filter and View Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search code, name, or assigned operator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="RUNNING">Running</option>
            <option value="IDLE">Idle</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="OFFLINE">Offline</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white hidden sm:block"
          >
            <option value="ALL">All Types</option>
            {STATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg border transition-colors ${
              viewMode === 'grid'
                ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                : 'text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg border transition-colors ${
              viewMode === 'table'
                ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                : 'text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
            title="Table View"
          >
            <TableIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredWorkstations.map((ws) => {
            const isRunning = ws.status === 'RUNNING';
            return (
              <div
                key={ws.id}
                className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  isRunning
                    ? 'border-emerald-200 ring-1 ring-emerald-100'
                    : ws.status === 'MAINTENANCE'
                    ? 'border-orange-200'
                    : 'border-slate-200'
                }`}
              >
                {/* Station Top Bar */}
                <div className="p-5 pb-4 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {ws.stationCode}
                        </span>
                        <span className="text-xs font-medium text-slate-500">{ws.stationType}</span>
                      </div>
                      <h3 className="font-semibold text-slate-900 mt-1.5 text-base">
                        {ws.stationName}
                      </h3>
                    </div>
                    <div>{getStatusBadge(ws.status)}</div>
                  </div>
                </div>

                {/* Station Body Details */}
                <div className="p-5 py-4 space-y-3 flex-1 bg-slate-50/50">
                  {/* Operator Tag */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                      Assigned Operator:
                    </span>
                    {ws.assignedEmployeeName ? (
                      <span className="font-medium text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {ws.assignedEmployeeName}
                        {ws.assignedEmployeeCode ? ` (${ws.assignedEmployeeCode})` : ''}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </div>

                  {/* Current Active Batch */}
                  <div className="flex items-start justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Package className="h-3.5 w-3.5 text-slate-400" />
                      Active Batch:
                    </span>
                    {ws.currentOrderNumber ? (
                      <div className="text-right">
                        <span className="font-mono font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {ws.currentOrderNumber}
                        </span>
                        {ws.currentProductName && (
                          <div className="text-[11px] text-slate-500 mt-1 truncate max-w-[160px]">
                            {ws.currentProductName}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">None (Ready for work)</span>
                    )}
                  </div>
                </div>

                {/* Station Bottom Controls */}
                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Quick Status Select */}
                  <div className="flex items-center gap-1.5">
                    <select
                      value={ws.status}
                      onChange={(e) => handleStatusChange(ws.id, e.target.value)}
                      className="text-xs py-1 px-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 text-slate-700 font-medium"
                    >
                      <option value="IDLE">Set Idle</option>
                      <option value="RUNNING">Set Running</option>
                      <option value="MAINTENANCE">Set Maint.</option>
                      <option value="OFFLINE">Set Offline</option>
                    </select>
                  </div>

                  {/* Action Icons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openAssignModal(ws)}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors text-xs font-medium flex items-center gap-1 border border-slate-200"
                      title="Assign Operator / Batch"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Assign</span>
                    </button>
                    <button
                      onClick={() => openEditModal(ws)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                      title="Edit Workstation"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(ws)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete Workstation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Code</th>
                  <th className="px-6 py-3.5">Workstation Name</th>
                  <th className="px-6 py-3.5">Station Type</th>
                  <th className="px-6 py-3.5">Operator</th>
                  <th className="px-6 py-3.5">Current Order</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredWorkstations.map((ws) => (
                  <tr key={ws.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                      {ws.stationCode}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{ws.stationName}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{ws.stationType}</td>
                    <td className="px-6 py-4 text-xs">
                      {ws.assignedEmployeeName ? (
                        <span className="font-medium text-slate-800">
                          {ws.assignedEmployeeName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {ws.currentOrderNumber ? (
                        <span className="font-mono font-medium text-indigo-600">
                          {ws.currentOrderNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(ws.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openAssignModal(ws)}
                          className="px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => openEditModal(ws)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(ws)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT WORKSTATION MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {selectedStation ? 'Edit Workstation' : 'Register New Workstation'}
              </h2>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Station Code *
                  </label>
                  <input
                    type="text"
                    name="stationCode"
                    placeholder="e.g. WS-08"
                    value={formik.values.stationCode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                      formik.touched.stationCode && formik.errors.stationCode
                        ? 'border-rose-500 focus:ring-rose-200'
                        : 'border-slate-200 focus:ring-indigo-500'
                    }`}
                  />
                  {formik.touched.stationCode && formik.errors.stationCode && (
                    <div className="text-xs text-rose-500 mt-1">{formik.errors.stationCode}</div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="IDLE">IDLE</option>
                    <option value="RUNNING">RUNNING</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Station Name *
                </label>
                <input
                  type="text"
                  name="stationName"
                  placeholder="e.g. Ultrasonic Cap Sealing Machine"
                  value={formik.values.stationName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    formik.touched.stationName && formik.errors.stationName
                      ? 'border-rose-500 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-indigo-500'
                  }`}
                />
                {formik.touched.stationName && formik.errors.stationName && (
                  <div className="text-xs text-rose-500 mt-1">{formik.errors.stationName}</div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Assembly Cell / Stage Type *
                </label>
                <select
                  name="stationType"
                  value={formik.values.stationType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {STATION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Assigned Operator
                  </label>
                  <select
                    name="assignedEmployeeId"
                    value={formik.values.assignedEmployeeId}
                    onChange={formik.handleChange}
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Current Batch / Order
                  </label>
                  <select
                    name="currentOrderId"
                    value={formik.values.currentOrderId}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">None (Standby)</option>
                    {orders
                      .filter((o) => o.status !== 'CANCELLED')
                      .map((ord) => (
                        <option key={ord.id} value={ord.id}>
                          {ord.orderNumber} ({ord.productName || 'Order'})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {formik.isSubmitting ? 'Saving...' : selectedStation ? 'Update Station' : 'Register Station'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ASSIGN OPERATOR & ORDER MODAL */}
      {isAssignModalOpen && selectedStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Assign Workstation: {selectedStation.stationCode}
                </h2>
                <p className="text-xs text-slate-500">{selectedStation.stationName}</p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={assignFormik.handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Assign Factory Operator
                </label>
                <select
                  name="employeeId"
                  value={assignFormik.values.employeeId}
                  onChange={assignFormik.handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">No Operator (Leave unassigned)</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeCode} - {emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Assign Active Production Batch
                </label>
                <select
                  name="orderId"
                  value={assignFormik.values.orderId}
                  onChange={assignFormik.handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">No Active Batch (Keep station idle)</option>
                  {orders
                    .filter((o) => o.status === 'PENDING' || o.status === 'IN_PROGRESS')
                    .map((ord) => (
                      <option key={ord.id} value={ord.id}>
                        {ord.orderNumber} - {ord.productName} ({ord.orderedQuantity} pens)
                      </option>
                    ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Assigning a batch will automatically switch station status to RUNNING.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignFormik.isSubmitting}
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {assignFormik.isSubmitting ? 'Saving...' : 'Apply Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Remove Workstation?</h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to remove{' '}
              <span className="font-semibold text-slate-800">
                {selectedStation.stationCode} ({selectedStation.stationName})
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
              >
                Delete Station
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkstationsPage;
