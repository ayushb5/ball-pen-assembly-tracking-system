import React, { useEffect, useState } from 'react';
import packagingService from '../services/packagingService';
import productionOrderService from '../services/productionOrderService';
import employeeService from '../services/employeeService';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {
  Box,
  Plus,
  Search,
  Edit2,
  Trash2,
  PackageCheck,
  Calendar,
  UserCheck,
  RefreshCw,
  X,
  AlertTriangle,
  Layers,
  Archive,
  ArrowRight,
} from 'lucide-react';

const PACKAGING_TYPES = [
  'Standard Carton (100 pens)',
  'Retail Blister Pack (10 pens)',
  'Office Pouch Pack (5 pens)',
  'Corporate Gift Pack (2 pens)',
  'Master Bulk Box (500 pens)',
];

function PackagingPage() {
  const [packagingList, setPackagingList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pkgRes, ordRes, empRes] = await Promise.allSettled([
        packagingService.getAll(),
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

      if (pkgRes.status === 'fulfilled') {
        setPackagingList(extractList(pkgRes.value));
      } else {
        setPackagingList([]);
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
      console.error('Error fetching packaging data:', err);
      setPackagingList([]);
    } finally {
      setLoading(false);
    }
  };

  const validationSchema = Yup.object({
    packageNumber: Yup.string()
      .required('Package number is required')
      .max(30, 'Maximum 30 characters'),
    productionOrderId: Yup.number().required('Production order is required'),
    quantity: Yup.number()
      .required('Quantity is required')
      .min(1, 'Quantity must be at least 1 pen'),
    packedById: Yup.number().required('Packaging operator is required'),
    packingDate: Yup.date().required('Packing date is required'),
  });

  const formik = useFormik({
    initialValues: {
      packageNumber: '',
      productionOrderId: '',
      quantity: 1000,
      packedById: '',
      packingDate: new Date().toISOString().split('T')[0],
      packagingType: PACKAGING_TYPES[0],
      remarks: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = {
          ...values,
          productionOrderId: Number(values.productionOrderId),
          quantity: Number(values.quantity),
          packedById: Number(values.packedById),
        };

        if (selectedPkg) {
          await packagingService.update(selectedPkg.id, payload);
          toast.success(`Package ${payload.packageNumber} updated`);
        } else {
          await packagingService.create(payload);
          toast.success(`Package ${payload.packageNumber} logged & inventory updated!`);
        }

        setIsFormModalOpen(false);
        setSelectedPkg(null);
        resetForm();
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Operation failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const openCreateModal = () => {
    setSelectedPkg(null);
    formik.resetForm();
    const autoNumber = `PKG-2026-00${packagingList.length + 1}`;
    formik.setFieldValue('packageNumber', autoNumber);
    if (orders.length > 0) formik.setFieldValue('productionOrderId', orders[0].id);
    if (employees.length > 0) formik.setFieldValue('packedById', employees[0].id);
    setIsFormModalOpen(true);
  };

  const openEditModal = (pkg) => {
    setSelectedPkg(pkg);
    formik.setValues({
      packageNumber: pkg.packageNumber,
      productionOrderId: pkg.productionOrderId,
      quantity: pkg.quantity,
      packedById: pkg.packedById,
      packingDate: pkg.packingDate,
      packagingType: pkg.packagingType || PACKAGING_TYPES[0],
      remarks: pkg.remarks || '',
    });
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (pkg) => {
    setSelectedPkg(pkg);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPkg) return;
    try {
      await packagingService.delete(selectedPkg.id);
      toast.success(`Package ${selectedPkg.packageNumber} deleted`);
      setIsDeleteModalOpen(false);
      setSelectedPkg(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete package');
    }
  };

  // KPIs
  const totalPackages = packagingList.length;
  const totalPensPackaged = packagingList.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalTypesCount = new Set(packagingList.map((p) => p.packagingType)).size;

  // Filtered List
  const filteredPackaging = packagingList.filter((pkg) => {
    const matchesSearch =
      pkg.packageNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg.orderNumber && pkg.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pkg.productName && pkg.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pkg.packedByName && pkg.packedByName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || pkg.packagingType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Box className="h-7 w-7 text-indigo-600" />
            Packaging Line
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pen boxing, blister packaging, carton labelling, and pallet staging
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
            Log Packaging Batch
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Batches
            </span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Box className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalPackages}</div>
          <div className="text-xs text-slate-500 mt-1">Packaged production lots</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Total Pens Boxed
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <PackageCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {totalPensPackaged.toLocaleString()}{' '}
            <span className="text-xs font-normal text-emerald-600">pens</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Transferred to finished inventory</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
              Packaging Specs
            </span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Layers className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-700 mt-2">{totalTypesCount}</div>
          <div className="text-xs text-slate-500 mt-1">Carton & blister form factors</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">
              Warehouse Intake
            </span>
            <span className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <Archive className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-teal-700 mt-2">Active</div>
          <div className="text-xs text-slate-500 mt-1">Staged in finished goods bays</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by package number, order, pen model, or packer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-full sm:w-auto"
        >
          <option value="ALL">All Packaging Specs</option>
          {PACKAGING_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Packaging Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Package ID</th>
                <th className="px-6 py-3.5">Production Order</th>
                <th className="px-6 py-3.5">Boxed Quantity</th>
                <th className="px-6 py-3.5">Packaging Spec</th>
                <th className="px-6 py-3.5">Packed By</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Remarks</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPackaging.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-50/75 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {pkg.packageNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-semibold text-indigo-600">
                      {pkg.orderNumber}
                    </span>
                    <div className="text-xs text-slate-700 font-medium mt-0.5">
                      {pkg.productName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Box className="h-4 w-4 text-slate-400" />
                      {pkg.quantity?.toLocaleString()} pens
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      {pkg.packagingType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className="font-medium text-slate-900 flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                      {pkg.packedByName}
                    </div>
                    {pkg.packedByCode && (
                      <div className="text-[11px] text-slate-400 pl-5">{pkg.packedByCode}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {pkg.packingDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 italic max-w-[200px] truncate">
                    {pkg.remarks || '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(pkg)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(pkg)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
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

      {/* CREATE / EDIT PACKAGING MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {selectedPkg ? 'Edit Packaging Batch' : 'Log Packaging Batch'}
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
                    Package No. *
                  </label>
                  <input
                    type="text"
                    name="packageNumber"
                    value={formik.values.packageNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {formik.touched.packageNumber && formik.errors.packageNumber && (
                    <div className="text-xs text-rose-500 mt-1">{formik.errors.packageNumber}</div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Packing Date *
                  </label>
                  <input
                    type="date"
                    name="packingDate"
                    value={formik.values.packingDate}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Production Order *
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Quantity Boxed *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formik.values.quantity}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Packaging Specification *
                  </label>
                  <select
                    name="packagingType"
                    value={formik.values.packagingType}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {PACKAGING_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Packed By Operator *
                </label>
                <select
                  name="packedById"
                  value={formik.values.packedById}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeCode} - {emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Remarks / Pallet Bay
                </label>
                <textarea
                  rows="2"
                  name="remarks"
                  value={formik.values.remarks}
                  onChange={formik.handleChange}
                  placeholder="e.g. 10 cartons sealed with barcode labels; pallet ready"
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
                  {formik.isSubmitting ? 'Saving...' : selectedPkg ? 'Update Package' : 'Log Packaging'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Packaging Record?</h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to delete packaging record{' '}
              <span className="font-semibold text-slate-800">{selectedPkg.packageNumber}</span>?
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

export default PackagingPage;
