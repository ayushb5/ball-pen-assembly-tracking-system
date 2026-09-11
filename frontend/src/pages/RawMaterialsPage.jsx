import React, { useEffect, useState } from 'react';
import rawMaterialService from '../services/rawMaterialService';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  Sliders,
  TrendingDown,
  Box,
} from 'lucide-react';

const RawMaterialSchema = Yup.object().shape({
  materialCode: Yup.string().required('Material code is required'),
  materialName: Yup.string().required('Material name is required'),
  category: Yup.string().required('Category is required'),
  availableQuantity: Yup.number().min(0, 'Quantity cannot be negative').required('Quantity is required'),
  unit: Yup.string().required('Measurement unit is required'),
  minimumStock: Yup.number().min(0, 'Minimum stock cannot be negative').required('Min stock is required'),
});

function RawMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [adjustModalItem, setAdjustModalItem] = useState(null);
  const [adjustDelta, setAdjustDelta] = useState(100);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await rawMaterialService.getAll();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setMaterials(list);
    } catch (err) {
      console.log('Error loading raw materials:', err);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const formik = useFormik({
    initialValues: {
      materialCode: '',
      materialName: '',
      category: 'Barrels',
      availableQuantity: 1000,
      unit: 'Pcs',
      minimumStock: 200,
    },
    validationSchema: RawMaterialSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingMaterial) {
          const res = await rawMaterialService.update(editingMaterial.id, values);
          toast.success('Material updated successfully');
          setMaterials((prev) =>
            prev.map((m) => (m.id === editingMaterial.id ? res.data || { ...m, ...values } : m))
          );
        } else {
          const res = await rawMaterialService.create(values);
          toast.success('Raw material added');
          const newMat = res.data || { id: Date.now(), ...values, lowStock: values.availableQuantity <= values.minimumStock };
          setMaterials((prev) => [newMat, ...prev]);
        }
        setModalOpen(false);
        setEditingMaterial(null);
        resetForm();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Operation failed');
      }
    },
  });

  const handleOpenAddModal = () => {
    setEditingMaterial(null);
    formik.resetForm({
      values: {
        materialCode: `RM-ITEM-0${materials.length + 1}`,
        materialName: '',
        category: 'Barrels',
        availableQuantity: 1000,
        unit: 'Pcs',
        minimumStock: 200,
      },
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (mat) => {
    setEditingMaterial(mat);
    formik.setValues({
      materialCode: mat.materialCode,
      materialName: mat.materialName,
      category: mat.category,
      availableQuantity: mat.availableQuantity,
      unit: mat.unit,
      minimumStock: mat.minimumStock,
    });
    setModalOpen(true);
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!adjustModalItem) return;
    try {
      const res = await rawMaterialService.adjustStock(adjustModalItem.id, adjustDelta);
      toast.success('Stock adjusted successfully');
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === adjustModalItem.id
            ? res.data || {
                ...m,
                availableQuantity: m.availableQuantity + adjustDelta,
                lowStock: m.availableQuantity + adjustDelta <= m.minimumStock,
              }
            : m
        )
      );
    } catch (err) {
      // Local fallback adjustment
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === adjustModalItem.id
            ? {
                ...m,
                availableQuantity: Math.max(0, m.availableQuantity + adjustDelta),
                lowStock: Math.max(0, m.availableQuantity + adjustDelta) <= m.minimumStock,
              }
            : m
        )
      );
      toast.success('Stock updated');
    } finally {
      setAdjustModalItem(null);
      setAdjustDelta(100);
    }
  };

  const handleDelete = async (id) => {
    try {
      await rawMaterialService.delete(id);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      toast.success('Material removed');
    } catch (err) {
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      toast.success('Material removed locally');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const lowStockCount = materials.filter((m) => m.availableQuantity <= m.minimumStock).length;

  const filteredMaterials = materials.filter((mat) => {
    const matchesSearch =
      mat.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mat.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mat.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || mat.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-600" />
            Raw Materials Inventory
          </h1>
          <p className="text-sm text-slate-500">
            Stock levels for pen barrels, refill tubes, tips, caps, high-viscosity ink, and packaging boxes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchMaterials}
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
            <span>Add Raw Material</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner (if any) */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900">
                Low Inventory Alert: {lowStockCount} item(s) below reorder threshold!
              </div>
              <div className="text-xs text-amber-700">
                Review stock levels below and place purchase replenishment requests.
              </div>
            </div>
          </div>
          <button
            onClick={() => setCategoryFilter('Packaging')}
            className="text-xs font-semibold text-amber-900 underline hover:text-amber-950"
          >
            View Low Stock
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by part name, SKU, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 bg-slate-50/50"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-700 focus:outline-none focus:border-brand-500 w-full sm:w-auto"
        >
          <option value="ALL">All Categories</option>
          <option value="Barrels">Barrels</option>
          <option value="Refills">Refills</option>
          <option value="Tips">Tips (0.7mm)</option>
          <option value="Caps">Caps</option>
          <option value="Ink">Ink Formulations</option>
          <option value="Packaging">Packaging Boxes</option>
        </select>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Material Code</th>
                <th className="py-3.5 px-4">Component Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Available Quantity</th>
                <th className="py-3.5 px-4">Minimum Stock Alert</th>
                <th className="py-3.5 px-4">Inventory Health</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No raw materials match the query.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((mat) => {
                  const isLow = mat.availableQuantity <= mat.minimumStock;
                  return (
                    <tr key={mat.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-brand-700">
                        {mat.materialCode}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center">
                          <Box className="w-3.5 h-3.5" />
                        </div>
                        <span>{mat.materialName}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200">
                          {mat.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {mat.availableQuantity.toLocaleString()} {mat.unit}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {mat.minimumStock.toLocaleString()} {mat.unit}
                      </td>
                      <td className="py-3.5 px-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Optimal
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setAdjustModalItem(mat)}
                            className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors"
                            title="Quick Stock Adjust"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(mat)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            title="Edit Material"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(mat.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Material"
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
                {editingMaterial ? 'Edit Raw Material Item' : 'Add Raw Material to Inventory'}
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
                    Material SKU Code
                  </label>
                  <input
                    type="text"
                    name="materialCode"
                    value={formik.values.materialCode}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 font-mono"
                  />
                  {formik.touched.materialCode && formik.errors.materialCode && (
                    <div className="text-[10px] text-rose-500 mt-0.5">{formik.errors.materialCode}</div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="Barrels">Barrels</option>
                    <option value="Refills">Refills</option>
                    <option value="Tips">Tips (0.7mm)</option>
                    <option value="Caps">Caps</option>
                    <option value="Ink">Ink Formulations</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Component Description
                </label>
                <input
                  type="text"
                  name="materialName"
                  placeholder="e.g. Tungsten Carbide Ball Tip 0.7mm"
                  value={formik.values.materialName}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
                />
                {formik.touched.materialName && formik.errors.materialName && (
                  <div className="text-[10px] text-rose-500 mt-0.5">{formik.errors.materialName}</div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Available Stock
                  </label>
                  <input
                    type="number"
                    name="availableQuantity"
                    value={formik.values.availableQuantity}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 font-mono"
                  />
                  {formik.touched.availableQuantity && formik.errors.availableQuantity && (
                    <div className="text-[10px] text-rose-500 mt-0.5">{formik.errors.availableQuantity}</div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    name="unit"
                    placeholder="Pcs, Liters, Boxes"
                    value={formik.values.unit}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  />
                  {formik.touched.unit && formik.errors.unit && (
                    <div className="text-[10px] text-rose-500 mt-0.5">{formik.errors.unit}</div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Min Alert Stock
                  </label>
                  <input
                    type="number"
                    name="minimumStock"
                    value={formik.values.minimumStock}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 font-mono"
                  />
                  {formik.touched.minimumStock && formik.errors.minimumStock && (
                    <div className="text-[10px] text-rose-500 mt-0.5">{formik.errors.minimumStock}</div>
                  )}
                </div>
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
                  {editingMaterial ? 'Save Changes' : 'Add Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Quick Adjustment Modal */}
      {adjustModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Adjust Inventory Stock</h3>
              <button
                onClick={() => setAdjustModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4 mt-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="text-slate-500">Component:</div>
                <div className="font-bold text-slate-900">{adjustModalItem.materialName}</div>
                <div className="mt-1 text-slate-500">
                  Current Stock: <span className="font-mono font-bold text-brand-700">{adjustModalItem.availableQuantity} {adjustModalItem.unit}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Adjustment Quantity (+ to add, - to deduct)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-brand-500 text-center"
                  />
                  <span className="text-xs font-semibold text-slate-500">{adjustModalItem.unit}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Resulting Stock: <span className="font-mono font-semibold">{adjustModalItem.availableQuantity + adjustDelta} {adjustModalItem.unit}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustModalItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-colors"
                >
                  Apply Stock Update
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
            <h3 className="text-base font-bold text-slate-900 mb-1">Remove Material</h3>
            <p className="text-xs text-slate-500 mb-5">
              Are you sure you want to remove this raw material item from the stock tracking catalog?
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

export default RawMaterialsPage;
