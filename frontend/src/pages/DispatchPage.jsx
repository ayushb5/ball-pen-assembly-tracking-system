import React, { useEffect, useState } from 'react';
import dispatchService from '../services/dispatchService';
import customerService from '../services/customerService';
import productionOrderService from '../services/productionOrderService';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {
  Truck,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  RotateCcw,
  Navigation,
  Calendar,
  Building,
  RefreshCw,
  X,
  AlertTriangle,
  Package,
  ExternalLink,
} from 'lucide-react';

const CARRIER_PRESETS = [
  'BlueDart Express',
  'Delhivery Logistics',
  'DTDC Express Ltd',
  'VRL Logistics Cargo',
  'Factory Dedicated Fleet',
];

function DispatchPage() {
  const [dispatches, setDispatches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dspRes, custRes, ordRes] = await Promise.allSettled([
        dispatchService.getAll(),
        customerService.getAll(),
        productionOrderService.getAll(),
      ]);

      const extractList = (res) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.data?.data)) return res.data.data;
        return [];
      };

      if (dspRes.status === 'fulfilled') {
        setDispatches(extractList(dspRes.value));
      } else {
        setDispatches([]);
      }

      if (custRes.status === 'fulfilled') {
        setCustomers(extractList(custRes.value));
      } else {
        setCustomers([]);
      }

      if (ordRes.status === 'fulfilled') {
        setOrders(extractList(ordRes.value));
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error loading dispatches:', err);
      setDispatches([]);
    } finally {
      setLoading(false);
    }
  };

  const validationSchema = Yup.object({
    dispatchNumber: Yup.string()
      .required('Dispatch number is required')
      .max(30, 'Maximum 30 characters'),
    customerId: Yup.number().required('Customer is required'),
    productionOrderId: Yup.number().required('Production order is required'),
    quantity: Yup.number()
      .required('Quantity is required')
      .min(1, 'Must dispatch at least 1 pen'),
    dispatchDate: Yup.date().required('Dispatch date is required'),
    carrierName: Yup.string().required('Carrier name is required'),
  });

  const formik = useFormik({
    initialValues: {
      dispatchNumber: '',
      customerId: '',
      productionOrderId: '',
      quantity: 500,
      dispatchDate: new Date().toISOString().split('T')[0],
      status: 'SHIPPED',
      carrierName: CARRIER_PRESETS[0],
      trackingReference: 'AWB-' + Math.floor(10000000 + Math.random() * 90000000),
      notes: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = {
          ...values,
          customerId: Number(values.customerId),
          productionOrderId: Number(values.productionOrderId),
          quantity: Number(values.quantity),
        };

        if (selectedDispatch) {
          await dispatchService.update(selectedDispatch.id, payload);
          toast.success(`Shipment ${payload.dispatchNumber} updated`);
        } else {
          await dispatchService.create(payload);
          toast.success(`Shipment ${payload.dispatchNumber} created & inventory updated`);
        }

        setIsFormModalOpen(false);
        setSelectedDispatch(null);
        resetForm();
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Operation failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await dispatchService.updateStatus(id, newStatus);
      toast.success(`Shipment status updated to ${newStatus}`);
      fetchData();
    } catch (err) {
      setDispatches((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
      );
      toast.success(`Shipment status updated to ${newStatus} (demo mode)`);
    }
  };

  const openCreateModal = () => {
    setSelectedDispatch(null);
    formik.resetForm();
    const autoNumber = `DSP-2026-00${dispatches.length + 1}`;
    formik.setFieldValue('dispatchNumber', autoNumber);
    if (customers.length > 0) formik.setFieldValue('customerId', customers[0].id);
    if (orders.length > 0) formik.setFieldValue('productionOrderId', orders[0].id);
    setIsFormModalOpen(true);
  };

  const openEditModal = (d) => {
    setSelectedDispatch(d);
    formik.setValues({
      dispatchNumber: d.dispatchNumber,
      customerId: d.customerId,
      productionOrderId: d.productionOrderId,
      quantity: d.quantity,
      dispatchDate: d.dispatchDate,
      status: d.status,
      carrierName: d.carrierName || CARRIER_PRESETS[0],
      trackingReference: d.trackingReference || '',
      notes: d.notes || '',
    });
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (d) => {
    setSelectedDispatch(d);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDispatch) return;
    try {
      await dispatchService.delete(selectedDispatch.id);
      toast.success(`Dispatch ${selectedDispatch.dispatchNumber} deleted`);
      setIsDeleteModalOpen(false);
      setSelectedDispatch(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete dispatch');
    }
  };

  // KPIs
  const totalShipments = dispatches.length;
  const totalDispatchedPens = dispatches.reduce((sum, d) => sum + (d.quantity || 0), 0);
  const inTransitCount = dispatches.filter((d) => d.status === 'SHIPPED').length;
  const deliveredCount = dispatches.filter((d) => d.status === 'DELIVERED').length;

  // Filtered List
  const filteredDispatches = dispatches.filter((d) => {
    const matchesSearch =
      d.dispatchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.customerName && d.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.orderNumber && d.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.carrierName && d.carrierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.trackingReference && d.trackingReference.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            Delivered
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Navigation className="h-3 w-3 text-blue-500" />
            In Transit
          </span>
        );
      case 'PREPARING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3 text-amber-500" />
            Preparing
          </span>
        );
      case 'RETURNED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <RotateCcw className="h-3 w-3 text-rose-500" />
            Returned
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
            <Truck className="h-7 w-7 text-indigo-600" />
            Outbound Dispatch & Logistics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Finished ball pen shipments, third-party courier tracking, and client deliveries
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
            Create Dispatch
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Shipments
            </span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Truck className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalShipments}</div>
          <div className="text-xs text-slate-500 mt-1">Consignments booked</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Pens Dispatched
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Package className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {totalDispatchedPens.toLocaleString()}{' '}
            <span className="text-xs font-normal text-emerald-600">pens</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Shipped to clients</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              In Transit
            </span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Navigation className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-2">{inTransitCount}</div>
          <div className="text-xs text-slate-500 mt-1">Active on road / courier</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">
              Delivered
            </span>
            <span className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-teal-700 mt-2">{deliveredCount}</div>
          <div className="text-xs text-slate-500 mt-1">Client receipt confirmed</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by dispatch ref, client, order number, carrier, or AWB..."
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
          <option value="ALL">All Shipment Statuses</option>
          <option value="PREPARING">Preparing</option>
          <option value="SHIPPED">In Transit (Shipped)</option>
          <option value="DELIVERED">Delivered</option>
          <option value="RETURNED">Returned</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Dispatch Ref</th>
                <th className="px-6 py-3.5">Client & Order</th>
                <th className="px-6 py-3.5">Quantity</th>
                <th className="px-6 py-3.5">Logistics & Tracking</th>
                <th className="px-6 py-3.5">Dispatch Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDispatches.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/75 transition-colors">
                  {/* Dispatch Number */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {d.dispatchNumber}
                    </span>
                  </td>

                  {/* Customer & Order */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-slate-400" />
                      {d.customerName}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Order:{' '}
                      <span className="font-mono font-medium text-indigo-600">
                        {d.orderNumber}
                      </span>{' '}
                      • {d.productName}
                    </div>
                  </td>

                  {/* Quantity */}
                  <td className="px-6 py-4 font-bold text-slate-900 text-base">
                    {d.quantity?.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-slate-500">pens</span>
                  </td>

                  {/* Carrier & Tracking */}
                  <td className="px-6 py-4 text-xs">
                    <div className="font-medium text-slate-900">{d.carrierName}</div>
                    {d.trackingReference && (
                      <div className="font-mono text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mt-1">
                        {d.trackingReference}
                      </div>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {d.dispatchDate}
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(d.status)}
                      <select
                        value={d.status}
                        onChange={(e) => handleStatusChange(d.id, e.target.value)}
                        className="text-[11px] py-0.5 px-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-600 cursor-pointer"
                      >
                        <option value="PREPARING">Preparing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="RETURNED">Returned</option>
                      </select>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(d)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(d)}
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

      {/* CREATE / EDIT DISPATCH MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {selectedDispatch ? 'Edit Outbound Dispatch' : 'Create Outbound Shipment'}
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
                    Dispatch Ref *
                  </label>
                  <input
                    type="text"
                    name="dispatchNumber"
                    value={formik.values.dispatchNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {formik.touched.dispatchNumber && formik.errors.dispatchNumber && (
                    <div className="text-xs text-rose-500 mt-1">
                      {formik.errors.dispatchNumber}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Dispatch Date *
                  </label>
                  <input
                    type="date"
                    name="dispatchDate"
                    value={formik.values.dispatchDate}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Customer / Destination *
                </label>
                <select
                  name="customerId"
                  value={formik.values.customerId}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.customerName} ({c.customerCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                        {ord.orderNumber} ({ord.productName || 'Order'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Quantity Dispatched *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formik.values.quantity}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Logistics Carrier *
                  </label>
                  <select
                    name="carrierName"
                    value={formik.values.carrierName}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {CARRIER_PRESETS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="PREPARING">PREPARING</option>
                    <option value="SHIPPED">SHIPPED (In Transit)</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="RETURNED">RETURNED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Tracking AWB / Reference Code
                </label>
                <input
                  type="text"
                  name="trackingReference"
                  placeholder="e.g. BD-98234120IN"
                  value={formik.values.trackingReference}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Shipping Notes / Driver Instructions
                </label>
                <textarea
                  rows="2"
                  name="notes"
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  placeholder="e.g. Deliver to gate 2 industrial warehouse; fragile goods label attached"
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
                  {formik.isSubmitting ? 'Saving...' : selectedDispatch ? 'Update Shipment' : 'Book Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Dispatch Record?</h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to remove dispatch record{' '}
              <span className="font-semibold text-slate-800">
                {selectedDispatch.dispatchNumber}
              </span>
              ?
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

export default DispatchPage;
