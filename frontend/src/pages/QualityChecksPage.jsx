import React, { useEffect, useState } from 'react';
import qualityService from '../services/qualityService';
import productionOrderService from '../services/productionOrderService';
import employeeService from '../services/employeeService';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  X,
  Package,
  Calendar,
  UserCheck,
  TrendingUp,
  Percent,
  AlertOctagon,
  FileCheck,
} from 'lucide-react';

const DEFECT_REASONS = [
  'Minor tip scratch and uneven ink release',
  'Air bubble in refill tube',
  'Tip ball friction / skip on paper test',
  'Cap snap fit loose / dimensional variance',
  'Barrel surface mold flash / cosmetic scratch',
  'Ink viscosity too high / slow flow',
  'Other / Custom defect',
];

function QualityChecksPage() {
  const [qualityChecks, setQualityChecks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedQC, setSelectedQC] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qcRes, ordRes, empRes] = await Promise.allSettled([
        qualityService.getAll(),
        productionOrderService.getAll(),
        employeeService.getAll(),
      ]);

      const extractList = (res) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.data?.data)) return res.data.data;
        return [];
      };

      if (qcRes.status === 'fulfilled') {
        setQualityChecks(extractList(qcRes.value));
      } else {
        setQualityChecks([]);
      }

      if (ordRes.status === 'fulfilled') {
        setOrders(extractList(ordRes.value));
      } else {
        setOrders([]);
      }

      if (empRes.status === 'fulfilled') {
        setEmployees(extractList(empRes.value));
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error('Error loading QC data:', err);
      setQualityChecks([]);
    } finally {
      setLoading(false);
    }
  };

  // Formik validation schema
  const validationSchema = Yup.object({
    checkNumber: Yup.string()
      .required('Check number is required')
      .max(30, 'Maximum 30 characters'),
    productionOrderId: Yup.number().required('Production order is required'),
    checkedQuantity: Yup.number()
      .required('Checked quantity is required')
      .min(1, 'Must check at least 1 unit'),
    rejectedQuantity: Yup.number()
      .required('Rejected quantity is required')
      .min(0, 'Cannot be negative'),
    passedQuantity: Yup.number()
      .required('Passed quantity is required')
      .min(0, 'Cannot be negative'),
    inspectorId: Yup.number().required('Inspector is required'),
    inspectionDate: Yup.date().required('Inspection date is required'),
    status: Yup.string().required('Status is required'),
  });

  const formik = useFormik({
    initialValues: {
      checkNumber: '',
      productionOrderId: '',
      checkedQuantity: 1000,
      passedQuantity: 990,
      rejectedQuantity: 10,
      rejectionReason: DEFECT_REASONS[0],
      inspectorId: '',
      inspectionDate: new Date().toISOString().split('T')[0],
      status: 'PASSED',
      notes: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = {
          ...values,
          productionOrderId: Number(values.productionOrderId),
          checkedQuantity: Number(values.checkedQuantity),
          passedQuantity: Number(values.passedQuantity),
          rejectedQuantity: Number(values.rejectedQuantity),
          inspectorId: Number(values.inspectorId),
        };

        if (selectedQC) {
          await qualityService.update(selectedQC.id, payload);
          toast.success(`Quality check ${payload.checkNumber} updated`);
        } else {
          await qualityService.create(payload);
          toast.success(`Quality check ${payload.checkNumber} logged`);
        }

        setIsFormModalOpen(false);
        setSelectedQC(null);
        resetForm();
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Operation failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Auto calculate passedQuantity whenever checkedQuantity or rejectedQuantity changes
  const handleQuantityChange = (field, value) => {
    formik.setFieldValue(field, value);
    const checked = field === 'checkedQuantity' ? Number(value) : Number(formik.values.checkedQuantity);
    const rejected = field === 'rejectedQuantity' ? Number(value) : Number(formik.values.rejectedQuantity);

    if (!isNaN(checked) && !isNaN(rejected)) {
      const calculatedPassed = Math.max(0, checked - rejected);
      formik.setFieldValue('passedQuantity', calculatedPassed);

      // Auto suggest status
      const passRate = checked > 0 ? calculatedPassed / checked : 0;
      if (passRate >= 0.95) {
        formik.setFieldValue('status', 'PASSED');
      } else if (passRate >= 0.85) {
        formik.setFieldValue('status', 'CONDITIONAL_PASS');
      } else {
        formik.setFieldValue('status', 'REJECTED');
      }
    }
  };

  const openCreateModal = () => {
    setSelectedQC(null);
    formik.resetForm();
    const autoNumber = `QC-2026-00${qualityChecks.length + 1}`;
    formik.setFieldValue('checkNumber', autoNumber);
    if (orders.length > 0) formik.setFieldValue('productionOrderId', orders[0].id);
    if (employees.length > 0) formik.setFieldValue('inspectorId', employees[0].id);
    setIsFormModalOpen(true);
  };

  const openEditModal = (qc) => {
    setSelectedQC(qc);
    formik.setValues({
      checkNumber: qc.checkNumber,
      productionOrderId: qc.productionOrderId,
      checkedQuantity: qc.checkedQuantity,
      passedQuantity: qc.passedQuantity,
      rejectedQuantity: qc.rejectedQuantity,
      rejectionReason: qc.rejectionReason || DEFECT_REASONS[0],
      inspectorId: qc.inspectorId,
      inspectionDate: qc.inspectionDate,
      status: qc.status,
      notes: qc.notes || '',
    });
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (qc) => {
    setSelectedQC(qc);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedQC) return;
    try {
      await qualityService.delete(selectedQC.id);
      toast.success(`Quality check ${selectedQC.checkNumber} deleted`);
      setIsDeleteModalOpen(false);
      setSelectedQC(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete QC check');
    }
  };

  // KPIs
  const totalChecked = qualityChecks.reduce((sum, item) => sum + (item.checkedQuantity || 0), 0);
  const totalPassed = qualityChecks.reduce((sum, item) => sum + (item.passedQuantity || 0), 0);
  const totalRejected = qualityChecks.reduce((sum, item) => sum + (item.rejectedQuantity || 0), 0);
  const overallYield = totalChecked > 0 ? ((totalPassed / totalChecked) * 100).toFixed(1) : '100.0';

  // Filtered List
  const filteredQCs = qualityChecks.filter((qc) => {
    const matchesSearch =
      qc.checkNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (qc.orderNumber && qc.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (qc.productName && qc.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (qc.inspectorName && qc.inspectorName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || qc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PASSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Passed
          </span>
        );
      case 'CONDITIONAL_PASS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            Conditional
          </span>
        );
      case 'REJECTED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="h-3.5 w-3.5 text-rose-500" />
            Rejected
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
            <ShieldCheck className="h-7 w-7 text-indigo-600" />
            Quality Control & Inspection
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pen quality assurance logs, defect root-cause analysis, and line pass-yield audit
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
            Log QC Inspection
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Inspected
            </span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {totalChecked.toLocaleString()} <span className="text-xs font-normal text-slate-500">pens</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Sampled & tested units</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Passed Units
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {totalPassed.toLocaleString()} <span className="text-xs font-normal text-emerald-600">pens</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Cleared for packaging</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">
              Defects / Rejections
            </span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertOctagon className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-2">
            {totalRejected.toLocaleString()} <span className="text-xs font-normal text-rose-600">pens</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Flagged for rework / recycling</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Overall Pass Yield
            </span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-indigo-700 mt-2">{overallYield}%</div>
          <div className="text-xs text-slate-500 mt-1">Target line standard: &gt;95.0%</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by QC code, order number, pen model, or inspector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-full sm:w-auto"
        >
          <option value="ALL">All Inspection Results</option>
          <option value="PASSED">Passed</option>
          <option value="CONDITIONAL_PASS">Conditional Pass</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* QC Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">QC Ref</th>
                <th className="px-6 py-3.5">Production Batch</th>
                <th className="px-6 py-3.5">Inspection Breakdown</th>
                <th className="px-6 py-3.5">Quality Pass Yield</th>
                <th className="px-6 py-3.5">Defect Analysis</th>
                <th className="px-6 py-3.5">Inspector</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQCs.map((qc) => (
                <tr key={qc.id} className="hover:bg-slate-50/75 transition-colors">
                  {/* QC Code & Date */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {qc.checkNumber}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {qc.inspectionDate}
                    </div>
                  </td>

                  {/* Order & Product */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-semibold text-indigo-600">
                      {qc.orderNumber}
                    </span>
                    <div className="text-xs text-slate-700 font-medium mt-0.5 truncate max-w-[180px]">
                      {qc.productName}
                    </div>
                  </td>

                  {/* Quantity Breakdown */}
                  <td className="px-6 py-4">
                    <div className="text-xs font-medium text-slate-900">
                      Total: {qc.checkedQuantity?.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] mt-0.5">
                      <span className="text-emerald-600 font-medium">✓ {qc.passedQuantity}</span>
                      <span className="text-rose-600 font-medium">✗ {qc.rejectedQuantity}</span>
                    </div>
                  </td>

                  {/* Pass Rate Progress */}
                  <td className="px-6 py-4 min-w-[130px]">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800">{qc.passRate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          qc.passRate >= 98
                            ? 'bg-emerald-500'
                            : qc.passRate >= 90
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, qc.passRate || 0)}%` }}
                      />
                    </div>
                  </td>

                  {/* Defect Reason */}
                  <td className="px-6 py-4">
                    {qc.rejectedQuantity > 0 ? (
                      <span className="text-xs text-slate-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 max-w-[200px] inline-block truncate">
                        {qc.rejectionReason || 'Defect noted'}
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Zero Defects
                      </span>
                    )}
                  </td>

                  {/* Inspector */}
                  <td className="px-6 py-4 text-xs">
                    <div className="font-medium text-slate-900 flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                      {qc.inspectorName}
                    </div>
                    {qc.inspectorCode && (
                      <div className="text-[11px] text-slate-400 pl-5">{qc.inspectorCode}</div>
                    )}
                  </td>

                  {/* Status Pill */}
                  <td className="px-6 py-4">{getStatusBadge(qc.status)}</td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(qc)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                        title="Edit inspection"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(qc)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete inspection"
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

      {/* CREATE / EDIT QC MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {selectedQC ? 'Edit QC Inspection' : 'Log Quality Inspection'}
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
                    QC Check Ref *
                  </label>
                  <input
                    type="text"
                    name="checkNumber"
                    value={formik.values.checkNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {formik.touched.checkNumber && formik.errors.checkNumber && (
                    <div className="text-xs text-rose-500 mt-1">{formik.errors.checkNumber}</div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Inspection Date *
                  </label>
                  <input
                    type="date"
                    name="inspectionDate"
                    value={formik.values.inspectionDate}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Production Order Batch *
                </label>
                <select
                  name="productionOrderId"
                  value={formik.values.productionOrderId}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {orders.map((ord) => (
                    <option key={ord.id} value={ord.id}>
                      {ord.orderNumber} — {ord.productName} ({ord.orderedQuantity} pens)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Checked Qty *
                  </label>
                  <input
                    type="number"
                    value={formik.values.checkedQuantity}
                    onChange={(e) => handleQuantityChange('checkedQuantity', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-700 uppercase mb-1">
                    Rejected Qty *
                  </label>
                  <input
                    type="number"
                    value={formik.values.rejectedQuantity}
                    onChange={(e) => handleQuantityChange('rejectedQuantity', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-700 uppercase mb-1">
                    Passed Qty *
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={formik.values.passedQuantity}
                    className="w-full px-3 py-2 text-sm border border-emerald-200 bg-emerald-50/50 rounded-lg text-emerald-800 font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    QC Inspector *
                  </label>
                  <select
                    name="inspectorId"
                    value={formik.values.inspectorId}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    QC Status *
                  </label>
                  <select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="PASSED">PASSED (&gt;95%)</option>
                    <option value="CONDITIONAL_PASS">CONDITIONAL PASS</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Defect / Rejection Reason
                </label>
                <select
                  name="rejectionReason"
                  value={formik.values.rejectionReason}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {DEFECT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Inspector Notes / Audit Remarks
                </label>
                <textarea
                  rows="2"
                  name="notes"
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  placeholder="e.g. Visual write test verified on 50 samples with standard blotter paper"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
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
                  {formik.isSubmitting ? 'Saving...' : selectedQC ? 'Update QC Record' : 'Save Inspection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedQC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete QC Record?</h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to delete inspection{' '}
              <span className="font-semibold text-slate-800">{selectedQC.checkNumber}</span>?
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QualityChecksPage;
