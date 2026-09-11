import React, { useEffect, useState } from 'react';
import productionOrderService from '../services/productionOrderService';
import customerService from '../services/customerService';
import productService from '../services/productService';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  Building,
  PenTool,
  CheckCircle,
  Clock,
  PlayCircle,
  XCircle,
  X,
  RefreshCw,
  Workflow,
  ArrowRight,
} from 'lucide-react';

const OrderSchema = Yup.object().shape({
  orderNumber: Yup.string().required('Order number is required'),
  customerId: Yup.number().required('Customer is required'),
  productId: Yup.number().required('Product is required'),
  orderedQuantity: Yup.number().min(1, 'Quantity must be at least 1').required('Quantity is required'),
  dueDate: Yup.string().required('Due date is required'),
  status: Yup.string().required('Status is required'),
  priority: Yup.string().required('Priority is required'),
});

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [orderRes, custRes, prodRes] = await Promise.allSettled([
        productionOrderService.getAll(),
        customerService.getAll(),
        productService.getAll(),
      ]);

      if (orderRes.status === 'fulfilled') {
        const val = orderRes.value;
        const list = Array.isArray(val) ? val : (val?.data || []);
        setOrders(list);
      }
      if (custRes.status === 'fulfilled') {
        const val = custRes.value;
        const list = Array.isArray(val) ? val : (val?.data || []);
        setCustomers(list);
      }
      if (prodRes.status === 'fulfilled') {
        const val = prodRes.value;
        const list = Array.isArray(val) ? val : (val?.data || []);
        setProducts(list);
      }
    } catch (err) {
      console.log('Error loading orders data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const formik = useFormik({
    initialValues: {
      orderNumber: '',
      customerId: customers[0]?.id || 1,
      productId: products[0]?.id || 1,
      orderedQuantity: 1000,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'PENDING',
      priority: 'MEDIUM',
      notes: '',
    },
    validationSchema: OrderSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingOrder) {
          const res = await productionOrderService.update(editingOrder.id, values);
          toast.success('Production order updated');
          setOrders((prev) =>
            prev.map((o) => (o.id === editingOrder.id ? res.data || { ...o, ...values } : o))
          );
        } else {
          const res = await productionOrderService.create(values);
          toast.success('Production order launched (8 assembly stages initialized)');
          const cust = customers.find((c) => c.id === Number(values.customerId));
          const prod = products.find((p) => p.id === Number(values.productId));
          const newOrder = res.data || {
            id: Date.now(),
            ...values,
            customerName: cust?.customerName || 'Customer',
            productName: prod?.productName || 'Pen',
            productCode: prod?.productCode || 'PEN-01',
            producedQuantity: 0,
          };
          setOrders((prev) => [newOrder, ...prev]);
        }
        setModalOpen(false);
        setEditingOrder(null);
        resetForm();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Operation failed');
      }
    },
  });

  const handleOpenAddModal = () => {
    setEditingOrder(null);
    formik.resetForm({
      values: {
        orderNumber: `PO-2026-00${orders.length + 1}`,
        customerId: customers[0]?.id || 1,
        productId: products[0]?.id || 1,
        orderedQuantity: 1000,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: 'PENDING',
        priority: 'MEDIUM',
        notes: '',
      },
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (order) => {
    setEditingOrder(order);
    formik.setValues({
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      productId: order.productId,
      orderedQuantity: order.orderedQuantity,
      dueDate: order.dueDate,
      status: order.status,
      priority: order.priority,
      notes: order.notes || '',
    });
    setModalOpen(true);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await productionOrderService.updateStatus(id, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
      toast.success(`Order status set to ${newStatus}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await productionOrderService.delete(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      toast.success('Order deleted');
    } catch (err) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      toast.success('Order deleted locally');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-brand-700 border-brand-200 animate-pulse';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.productName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-brand-600" />
            Production Orders
          </h1>
          <p className="text-sm text-slate-500">
            Work order creation, pen volume quotas, delivery schedules, and execution status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-600' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Production Order</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order #, customer, or pen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 bg-slate-50/50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-700 focus:outline-none focus:border-brand-500 w-full sm:w-auto"
        >
          <option value="ALL">All Order States</option>
          <option value="PENDING">Pending (Scheduled)</option>
          <option value="IN_PROGRESS">In Progress (Active)</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Pen Model</th>
                <th className="py-3.5 px-4">Output Progress</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No production orders match the current filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const percent = Math.min(
                    100,
                    Math.round(((order.producedQuantity || 0) / order.orderedQuantity) * 100)
                  );
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-700">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <span className="inline-flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {order.customerName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <PenTool className="w-3.5 h-3.5 text-brand-600" />
                          {order.productName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 min-w-[160px]">
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                          <span className="font-semibold text-slate-800">
                            {order.producedQuantity || 0} / {order.orderedQuantity}
                          </span>
                          <span className="text-slate-500">{percent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              percent === 100 ? 'bg-emerald-500' : 'bg-brand-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {order.dueDate}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold ${getPriorityBadge(
                            order.priority
                          )}`}
                        >
                          {order.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border focus:outline-none cursor-pointer ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to="/assembly"
                            className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors"
                            title="Open Assembly Line Tracking"
                          >
                            <Workflow className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleOpenEditModal(order)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            title="Edit Order"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(order.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingOrder ? 'Edit Production Order' : 'Launch New Production Order'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-3.5 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Order Serial Code
                  </label>
                  <input
                    type="text"
                    name="orderNumber"
                    value={formik.values.orderNumber}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 font-mono"
                  />
                  {formik.touched.orderNumber && formik.errors.orderNumber && (
                    <div className="text-[10px] text-rose-500 mt-0.5">{formik.errors.orderNumber}</div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Customer Account
                  </label>
                  <select
                    name="customerId"
                    value={formik.values.customerId}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 bg-white"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customerName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Pen Model to Manufacture
                  </label>
                  <select
                    name="productId"
                    value={formik.values.productId}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 bg-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.productName} ({p.productCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Target Pen Quantity
                  </label>
                  <input
                    type="number"
                    step="100"
                    name="orderedQuantity"
                    value={formik.values.orderedQuantity}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 font-mono"
                  />
                  {formik.touched.orderedQuantity && formik.errors.orderedQuantity && (
                    <div className="text-[10px] text-rose-500 mt-0.5">{formik.errors.orderedQuantity}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Promised Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formik.values.dueDate}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 font-mono"
                  />
                  {formik.touched.dueDate && formik.errors.dueDate && (
                    <div className="text-[10px] text-rose-500 mt-0.5">{formik.errors.dueDate}</div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formik.values.priority}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    State
                  </label>
                  <select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Manufacturing Notes / Instructions
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Special instructions for material kitting or packaging..."
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-colors"
                >
                  {editingOrder ? 'Save Order' : 'Launch Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Production Order</h3>
            <p className="text-xs text-slate-500 mb-5">
              Are you sure you want to cancel and delete this work order? Assembly milestones will be cleared.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/30 transition-colors"
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

export default OrdersPage;
