import React, { useEffect, useState } from 'react';
import finishedGoodsService from '../services/finishedGoodsService';
import productService from '../services/productService';
import productionOrderService from '../services/productionOrderService';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {
  Archive,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Truck,
  DollarSign,
  MapPin,
  RefreshCw,
  X,
  AlertTriangle,
  Send,
  Layers,
  Sparkles,
} from 'lucide-react';

function FinishedGoodsPage() {
  const [goods, setGoods] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dispatchFilter, setDispatchFilter] = useState('ALL');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGood, setSelectedGood] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fgRes, prodRes, ordRes] = await Promise.allSettled([
        finishedGoodsService.getAll(),
        productService.getAll(),
        productionOrderService.getAll(),
      ]);

      const extractList = (res) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.data?.data)) return res.data.data;
        return [];
      };

      if (fgRes.status === 'fulfilled') {
        setGoods(extractList(fgRes.value));
      } else {
        setGoods([]);
      }

      if (prodRes.status === 'fulfilled') {
        setProducts(extractList(prodRes.value));
      } else {
        setProducts([]);
      }

      if (ordRes.status === 'fulfilled') {
        setOrders(extractList(ordRes.value));
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching finished goods:', err);
      setGoods([]);
    } finally {
      setLoading(false);
    }
  };

  const validationSchema = Yup.object({
    productId: Yup.number().required('Product is required'),
    productionOrderId: Yup.number().required('Production order is required'),
    quantity: Yup.number()
      .required('Quantity is required')
      .min(1, 'Quantity must be at least 1 pen'),
    warehouseLocation: Yup.string()
      .required('Warehouse location is required')
      .max(100, 'Maximum 100 characters'),
    receivedDate: Yup.date().required('Received date is required'),
  });

  const formik = useFormik({
    initialValues: {
      productId: '',
      productionOrderId: '',
      quantity: 1000,
      warehouseLocation: 'Bay-A / Shelf-01',
      readyForDispatch: true,
      status: 'IN_STOCK',
      receivedDate: new Date().toISOString().split('T')[0],
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = {
          ...values,
          productId: Number(values.productId),
          productionOrderId: Number(values.productionOrderId),
          quantity: Number(values.quantity),
        };

        if (selectedGood) {
          await finishedGoodsService.update(selectedGood.id, payload);
          toast.success('Finished stock record updated');
        } else {
          await finishedGoodsService.create(payload);
          toast.success('Finished goods added to warehouse inventory');
        }

        setIsFormModalOpen(false);
        setSelectedGood(null);
        resetForm();
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Operation failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleToggleDispatch = async (item) => {
    try {
      await finishedGoodsService.toggleDispatchReady(item.id);
      toast.success(
        `Batch ${item.orderNumber} marked as ${
          item.readyForDispatch ? 'Staging' : 'Ready for Dispatch'
        }`
      );
      fetchData();
    } catch (err) {
      setGoods((prev) =>
        prev.map((g) => (g.id === item.id ? { ...g, readyForDispatch: !g.readyForDispatch } : g))
      );
      toast.success('Dispatch status toggled (demo mode)');
    }
  };

  const openCreateModal = () => {
    setSelectedGood(null);
    formik.resetForm();
    if (products.length > 0) formik.setFieldValue('productId', products[0].id);
    if (orders.length > 0) formik.setFieldValue('productionOrderId', orders[0].id);
    setIsFormModalOpen(true);
  };

  const openEditModal = (item) => {
    setSelectedGood(item);
    formik.setValues({
      productId: item.productId,
      productionOrderId: item.productionOrderId,
      quantity: item.quantity,
      warehouseLocation: item.warehouseLocation,
      readyForDispatch: item.readyForDispatch,
      status: item.status,
      receivedDate: item.receivedDate,
    });
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (item) => {
    setSelectedGood(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedGood) return;
    try {
      await finishedGoodsService.delete(selectedGood.id);
      toast.success('Finished stock record removed');
      setIsDeleteModalOpen(false);
      setSelectedGood(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record');
    }
  };

  // KPIs
  const totalStockPens = goods.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const readyStockPens = goods
    .filter((g) => g.readyForDispatch)
    .reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalValuation = goods.reduce((sum, item) => sum + (item.totalValuation || 0), 0);
  const uniqueBays = new Set(goods.map((g) => g.warehouseLocation)).size;

  // Filtered List
  const filteredGoods = goods.filter((item) => {
    const matchesSearch =
      (item.productName && item.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.productCode && item.productCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.orderNumber && item.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.warehouseLocation &&
        item.warehouseLocation.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesDispatch =
      dispatchFilter === 'ALL' ||
      (dispatchFilter === 'READY' && item.readyForDispatch) ||
      (dispatchFilter === 'STAGING' && !item.readyForDispatch);

    return matchesSearch && matchesStatus && matchesDispatch;
  });

  const getInkColorBg = (color) => {
    switch (color?.toLowerCase()) {
      case 'blue':
        return 'bg-blue-600';
      case 'black':
        return 'bg-slate-900';
      case 'red':
        return 'bg-rose-600';
      case 'green':
        return 'bg-emerald-600';
      default:
        return 'bg-indigo-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Archive className="h-7 w-7 text-indigo-600" />
            Finished Goods Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Completed ball pen stock, warehouse bay allocations, and client dispatch staging
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
            Register Stock
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total In-Stock
            </span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Archive className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {totalStockPens.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-500">pens</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Stored across all warehouse bays</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Ready For Dispatch
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Truck className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {readyStockPens.toLocaleString()}{' '}
            <span className="text-xs font-normal text-emerald-600">pens</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Cleared for carrier pickup</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
              Stock Valuation
            </span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-700 mt-2">
            ₹{totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">Calculated at selling price</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">
              Warehouse Locations
            </span>
            <span className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <MapPin className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-teal-700 mt-2">{uniqueBays} bays</div>
          <div className="text-xs text-slate-500 mt-1">Organized pallet shelves</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by pen model, code, order reference, or warehouse bay..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="ALL">All Stock Statuses</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="RESERVED">Reserved</option>
            <option value="DISPATCHED">Dispatched</option>
          </select>
          <select
            value={dispatchFilter}
            onChange={(e) => setDispatchFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="ALL">All Dispatch Readiness</option>
            <option value="READY">Ready for Dispatch</option>
            <option value="STAGING">Staging / Hold</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Product Specification</th>
                <th className="px-6 py-3.5">Batch Ref</th>
                <th className="px-6 py-3.5">Available Stock</th>
                <th className="px-6 py-3.5">Warehouse Bay</th>
                <th className="px-6 py-3.5">Dispatch Readiness</th>
                <th className="px-6 py-3.5">Valuation</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGoods.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/75 transition-colors">
                  {/* Product */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`h-3 w-3 rounded-full shrink-0 ${getInkColorBg(item.inkColor)}`}
                        title={`Ink: ${item.inkColor}`}
                      />
                      <div>
                        <div className="font-semibold text-slate-900">{item.productName}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          {item.productCode} • {item.penType}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Production Order */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {item.orderNumber}
                    </span>
                  </td>

                  {/* Stock Quantity */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-base">
                      {item.quantity?.toLocaleString()}{' '}
                      <span className="text-xs font-normal text-slate-500">pens</span>
                    </div>
                  </td>

                  {/* Warehouse Bay */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {item.warehouseLocation}
                    </span>
                  </td>

                  {/* Dispatch Readiness Toggle */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleDispatch(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        item.readyForDispatch
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {item.readyForDispatch ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                          Ready for Dispatch
                        </>
                      ) : (
                        <>
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                          Staging / Hold
                        </>
                      )}
                    </button>
                  </td>

                  {/* Valuation */}
                  <td className="px-6 py-4 font-mono font-medium text-slate-900 text-xs">
                    ₹{item.totalValuation?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {item.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(item)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete Record"
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

      {/* CREATE / EDIT FINISHED GOODS MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {selectedGood ? 'Edit Finished Stock' : 'Register Finished Goods'}
              </h2>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Product *
                </label>
                <select
                  name="productId"
                  value={formik.values.productId}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.productName} ({p.productCode}) — ₹{p.sellingPrice}
                    </option>
                  ))}
                </select>
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
                      {ord.orderNumber} ({ord.productName || 'Order'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Quantity (Pens) *
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
                    Received Date *
                  </label>
                  <input
                    type="date"
                    name="receivedDate"
                    value={formik.values.receivedDate}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Warehouse Bay Location *
                  </label>
                  <input
                    type="text"
                    name="warehouseLocation"
                    placeholder="e.g. Bay-A / Shelf-02"
                    value={formik.values.warehouseLocation}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
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
                    <option value="IN_STOCK">IN_STOCK</option>
                    <option value="RESERVED">RESERVED</option>
                    <option value="DISPATCHED">DISPATCHED</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="readyForDispatch"
                    checked={formik.values.readyForDispatch}
                    onChange={formik.handleChange}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Tag as Ready for Dispatch immediately
                  </span>
                </label>
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
                  {formik.isSubmitting ? 'Saving...' : selectedGood ? 'Update Record' : 'Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedGood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Stock Record?</h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to remove stock for{' '}
              <span className="font-semibold text-slate-800">{selectedGood.productName}</span>?
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

export default FinishedGoodsPage;
