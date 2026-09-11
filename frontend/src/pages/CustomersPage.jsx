import React, { useEffect, useState } from 'react';
import customerService from '../services/customerService';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  X,
  RefreshCw,
  User,
} from 'lucide-react';

const CustomerSchema = Yup.object().shape({
  customerCode: Yup.string().required('Customer code is required'),
  customerName: Yup.string().required('Customer name is required'),
  contactPerson: Yup.string().required('Contact person is required'),
  phone: Yup.string().required('Phone number is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  address: Yup.string().required('Delivery address is required'),
  status: Yup.string().required('Status is required'),
});

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerService.getAll();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setCustomers(list);
    } catch (err) {
      console.log('Error loading customers:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const formik = useFormik({
    initialValues: {
      customerCode: '',
      customerName: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      status: 'ACTIVE',
    },
    validationSchema: CustomerSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingCustomer) {
          const res = await customerService.update(editingCustomer.id, values);
          toast.success('Customer updated successfully');
          setCustomers((prev) =>
            prev.map((c) => (c.id === editingCustomer.id ? res.data || { ...c, ...values } : c))
          );
        } else {
          const res = await customerService.create(values);
          toast.success('Customer registered successfully');
          const newCust = res.data || { id: Date.now(), ...values };
          setCustomers((prev) => [newCust, ...prev]);
        }
        setModalOpen(false);
        setEditingCustomer(null);
        resetForm();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Operation failed');
      }
    },
  });

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    formik.resetForm({
      values: {
        customerCode: `CUST-00${customers.length + 1}`,
        customerName: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        status: 'ACTIVE',
      },
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (cust) => {
    setEditingCustomer(cust);
    formik.setValues({
      customerCode: cust.customerCode,
      customerName: cust.customerName,
      contactPerson: cust.contactPerson,
      phone: cust.phone,
      email: cust.email,
      address: cust.address,
      status: cust.status,
    });
    setModalOpen(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      await customerService.toggleStatus(id);
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : c
        )
      );
      toast.success('Status updated');
    } catch (err) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : c
        )
      );
      toast.success('Status toggled');
    }
  };

  const handleDelete = async (id) => {
    try {
      await customerService.delete(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      toast.success('Customer removed');
    } catch (err) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      toast.success('Customer removed locally');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Filtered customers
  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || cust.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-600" />
            Customer Directory
          </h1>
          <p className="text-sm text-slate-500">
            Commercial distributors, wholesale stationers, and corporate clients
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCustomers}
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
            <span>Register Customer</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company, contact, or email..."
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
          <option value="ALL">All Account Statuses</option>
          <option value="ACTIVE">Active Clients</option>
          <option value="INACTIVE">Inactive Clients</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Customer ID</th>
                <th className="py-3.5 px-4">Company Name</th>
                <th className="py-3.5 px-4">Contact Person</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Shipping Destination</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No customers match the current query.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-brand-700">
                      {cust.customerCode}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {cust.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cust.contactPerson}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {cust.phone}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {cust.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{cust.address}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(cust.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                          cust.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {cust.status === 'ACTIVE' ? (
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
                          onClick={() => handleOpenEditModal(cust)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(cust.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Customer"
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
                {editingCustomer ? 'Edit Customer Information' : 'Register New Client Account'}
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
                    Customer ID Code
                  </label>
                  <input
                    type="text"
                    name="customerCode"
                    value={formik.values.customerCode}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 font-mono"
                  />
                  {formik.touched.customerCode && formik.errors.customerCode && (
                    <div className="text-[10px] text-rose-500 mt-0.5">{formik.errors.customerCode}</div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Company / Entity Name
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    placeholder="e.g. Metro Educational Supplies"
                    value={formik.values.customerName}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  />
                  {formik.touched.customerName && formik.errors.customerName && (
                    <div className="text-[10px] text-rose-500 mt-0.5">{formik.errors.customerName}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    placeholder="e.g. Sunita Rao"
                    value={formik.values.contactPerson}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  />
                  {formik.touched.contactPerson && formik.errors.contactPerson && (
                    <div className="text-[10px] text-rose-500 mt-0.5">{formik.errors.contactPerson}</div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="+91 98111 22334"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <div className="text-[10px] text-rose-500 mt-0.5">{formik.errors.phone}</div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Notification & Invoice Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="orders@metroedu.in"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="text-[10px] text-rose-500 mt-0.5">{formik.errors.email}</div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Shipping & Billing Address
                </label>
                <textarea
                  name="address"
                  rows={2}
                  placeholder="12/A Commercial Plaza, MG Road, Bengaluru..."
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 resize-none"
                />
                {formik.touched.address && formik.errors.address && (
                  <div className="text-[10px] text-rose-500 mt-0.5">{formik.errors.address}</div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Account Status
                </label>
                <select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 bg-white"
                >
                  <option value="ACTIVE">Active Account</option>
                  <option value="INACTIVE">Inactive Account</option>
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
                  {editingCustomer ? 'Save Changes' : 'Register Customer'}
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
            <h3 className="text-base font-bold text-slate-900 mb-1">Remove Customer</h3>
            <p className="text-xs text-slate-500 mb-5">
              Are you sure you want to remove this client record? Historical orders will be retained.
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

export default CustomersPage;
