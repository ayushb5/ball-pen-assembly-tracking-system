import React, { useEffect, useState } from 'react';
import productService from '../services/productService';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {
  PenTool,
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  CheckCircle,
  XCircle,
  X,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const ProductSchema = Yup.object().shape({
  productCode: Yup.string().required('Product code is required'),
  productName: Yup.string().required('Product name is required'),
  inkColor: Yup.string().required('Ink color is required'),
  bodyColor: Yup.string().required('Body color is required'),
  penType: Yup.string().required('Pen type is required'),
  sellingPrice: Yup.number().positive('Price must be greater than 0').required('Selling price is required'),
  status: Yup.string().required('Status is required'),
});

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [penTypeFilter, setPenTypeFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getAll();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setProducts(list);
    } catch (err) {
      console.log('Error loading products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const formik = useFormik({
    initialValues: {
      productCode: '',
      productName: '',
      inkColor: 'Blue',
      bodyColor: '',
      penType: 'Ballpoint',
      sellingPrice: 10.0,
      status: 'ACTIVE',
    },
    validationSchema: ProductSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingProduct) {
          const res = await productService.update(editingProduct.id, values);
          toast.success('Product updated successfully');
          setProducts((prev) =>
            prev.map((p) => (p.id === editingProduct.id ? res.data || { ...p, ...values } : p))
          );
        } else {
          const res = await productService.create(values);
          toast.success('Product added to catalog');
          const newProd = res.data || { id: Date.now(), ...values };
          setProducts((prev) => [newProd, ...prev]);
        }
        setModalOpen(false);
        setEditingProduct(null);
        resetForm();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Operation failed');
      }
    },
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    formik.resetForm({
      values: {
        productCode: `PEN-SKU-0${products.length + 1}`,
        productName: '',
        inkColor: 'Blue',
        bodyColor: '',
        penType: 'Ballpoint',
        sellingPrice: 10.0,
        status: 'ACTIVE',
      },
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    formik.setValues({
      productCode: prod.productCode,
      productName: prod.productName,
      inkColor: prod.inkColor,
      bodyColor: prod.bodyColor,
      penType: prod.penType,
      sellingPrice: prod.sellingPrice,
      status: prod.status,
    });
    setModalOpen(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      await productService.toggleStatus(id);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : p
        )
      );
      toast.success('Product status updated');
    } catch (err) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : p
        )
      );
      toast.success('Product status updated locally');
    }
  };

  const handleDelete = async (id) => {
    try {
      await productService.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product removed from catalog');
    } catch (err) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product removed locally');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const getInkColorDot = (color) => {
    switch (color?.toLowerCase()) {
      case 'blue':
        return 'bg-blue-600';
      case 'black':
        return 'bg-slate-900';
      case 'red':
        return 'bg-red-600';
      case 'green':
        return 'bg-emerald-600';
      default:
        return 'bg-slate-400';
    }
  };

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.inkColor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = penTypeFilter === 'ALL' || prod.penType === penTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PenTool className="w-6 h-6 text-brand-600" />
            Products Catalog
          </h1>
          <p className="text-sm text-slate-500">
            Ball pen models, ink formulations, barrel color styling, and unit prices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
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
            <span>Add Pen Model</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by pen name, SKU, or ink color..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 bg-slate-50/50"
          />
        </div>

        <select
          value={penTypeFilter}
          onChange={(e) => setPenTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-700 focus:outline-none focus:border-brand-500 w-full sm:w-auto"
        >
          <option value="ALL">All Pen Types</option>
          <option value="Ballpoint">Ballpoint Pens</option>
          <option value="Gel">Gel Pens</option>
          <option value="Rollerball">Rollerball Pens</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product Code</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Ink Color</th>
                <th className="py-3.5 px-4">Body Color</th>
                <th className="py-3.5 px-4">Pen Type</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No pen models found in catalog.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-brand-700">
                      {prod.productCode}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center">
                        <PenTool className="w-3.5 h-3.5" />
                      </div>
                      <span>{prod.productName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-medium text-[11px]">
                        <span className={`w-2 h-2 rounded-full ${getInkColorDot(prod.inkColor)}`} />
                        {prod.inkColor}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {prod.bodyColor}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">
                        <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                        {prod.penType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                      ₹{Number(prod.sellingPrice).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(prod.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                          prod.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {prod.status === 'ACTIVE' ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(prod.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
                {editingProduct ? 'Edit Pen Specifications' : 'Add New Pen to Catalog'}
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
                    Product Code (SKU)
                  </label>
                  <input
                    type="text"
                    name="productCode"
                    value={formik.values.productCode}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 font-mono"
                  />
                  {formik.touched.productCode && formik.errors.productCode && (
                    <div className="text-[10px] text-rose-500 mt-0.5">{formik.errors.productCode}</div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Product Commercial Name
                  </label>
                  <input
                    type="text"
                    name="productName"
                    placeholder="e.g. Classic Grip Ball Pen - Blue"
                    value={formik.values.productName}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  />
                  {formik.touched.productName && formik.errors.productName && (
                    <div className="text-[10px] text-rose-500 mt-0.5">{formik.errors.productName}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Ink Color
                  </label>
                  <select
                    name="inkColor"
                    value={formik.values.inkColor}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="Blue">Blue</option>
                    <option value="Black">Black</option>
                    <option value="Red">Red</option>
                    <option value="Green">Green</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Body Color
                  </label>
                  <input
                    type="text"
                    name="bodyColor"
                    placeholder="e.g. Transparent Blue"
                    value={formik.values.bodyColor}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  />
                  {formik.touched.bodyColor && formik.errors.bodyColor && (
                    <div className="text-[10px] text-rose-500 mt-0.5">{formik.errors.bodyColor}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Pen Type
                  </label>
                  <select
                    name="penType"
                    value={formik.values.penType}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="Ballpoint">Ballpoint</option>
                    <option value="Gel">Gel</option>
                    <option value="Rollerball">Rollerball</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Selling Price (INR)
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    name="sellingPrice"
                    placeholder="10.00"
                    value={formik.values.sellingPrice}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 font-mono"
                  />
                  {formik.touched.sellingPrice && formik.errors.sellingPrice && (
                    <div className="text-[10px] text-rose-500 mt-0.5">{formik.errors.sellingPrice}</div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Catalog Status
                </label>
                <select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 bg-white"
                >
                  <option value="ACTIVE">Active in Catalog</option>
                  <option value="INACTIVE">Inactive / Discontinued</option>
                </select>
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
                  {editingProduct ? 'Save Specifications' : 'Add to Catalog'}
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
            <h3 className="text-base font-bold text-slate-900 mb-1">Remove Pen SKU</h3>
            <p className="text-xs text-slate-500 mb-5">
              Are you sure you want to remove this pen from active catalog? Past orders will remain intact.
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
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
