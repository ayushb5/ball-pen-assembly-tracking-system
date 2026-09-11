import React, { useEffect, useState } from 'react';
import employeeService from '../services/employeeService';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Phone,
  Shield,
  CheckCircle,
  XCircle,
  X,
  Building,
  RefreshCw,
} from 'lucide-react';

const EmployeeSchema = Yup.object().shape({
  employeeCode: Yup.string().required('Employee code is required'),
  fullName: Yup.string().required('Full name is required'),
  phone: Yup.string().nullable(),
  department: Yup.string().required('Department is required'),
  role: Yup.string().required('Role is required'),
  status: Yup.string().required('Status is required'),
});

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await employeeService.getAll();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setEmployees(list);
    } catch (err) {
      console.log('Error loading employees:', err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const formik = useFormik({
    initialValues: {
      employeeCode: '',
      fullName: '',
      phone: '',
      department: 'Assembly Line',
      role: 'OPERATOR',
      status: 'ACTIVE',
    },
    validationSchema: EmployeeSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingEmployee) {
          const res = await employeeService.update(editingEmployee.id, values);
          toast.success('Employee updated successfully');
          setEmployees((prev) =>
            prev.map((e) => (e.id === editingEmployee.id ? res.data || { ...e, ...values } : e))
          );
        } else {
          const res = await employeeService.create(values);
          toast.success('Employee added successfully');
          const newEmp = res.data || { id: Date.now(), ...values };
          setEmployees((prev) => [newEmp, ...prev]);
        }
        setModalOpen(false);
        setEditingEmployee(null);
        resetForm();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Operation failed');
      }
    },
  });

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    formik.resetForm({
      values: {
        employeeCode: `EMP-00${employees.length + 1}`,
        fullName: '',
        phone: '',
        department: 'Assembly Line',
        role: 'OPERATOR',
        status: 'ACTIVE',
      },
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp);
    formik.setValues({
      employeeCode: emp.employeeCode,
      fullName: emp.fullName,
      phone: emp.phone || '',
      department: emp.department,
      role: emp.role,
      status: emp.status,
    });
    setModalOpen(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      await employeeService.toggleStatus(id);
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, status: e.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : e
        )
      );
      toast.success('Status updated');
    } catch (err) {
      // Local fallback toggle
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, status: e.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : e
        )
      );
      toast.success('Status toggled');
    }
  };

  const handleDelete = async (id) => {
    try {
      await employeeService.delete(id);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      toast.success('Employee removed');
    } catch (err) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      toast.success('Employee removed locally');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Filtered list
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
    const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;

    return matchesSearch && matchesDept && matchesRole;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SUPERVISOR':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-brand-50 text-brand-700 border-brand-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600" />
            Plant Employees & Operators
          </h1>
          <p className="text-sm text-slate-500">
            Workforce directory, production line assignments, and plant access control
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchEmployees}
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
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID code, or dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Departments</option>
            <option value="Production">Production</option>
            <option value="Assembly Line">Assembly Line</option>
            <option value="Quality Control">Quality Control</option>
            <option value="Packaging & Warehouse">Packaging & Warehouse</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Management">Management</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="OPERATOR">Operator</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No employees match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-brand-700">
                      {emp.employeeCode}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-xs">
                        {emp.fullName.charAt(0)}
                      </div>
                      <span>{emp.fullName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {emp.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${getRoleBadge(
                          emp.role
                        )}`}
                      >
                        <Shield className="w-3 h-3" />
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {emp.phone || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(emp.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                          emp.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {emp.status === 'ACTIVE' ? (
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
                          onClick={() => handleOpenEditModal(emp)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="Edit Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(emp.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Employee"
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
                {editingEmployee ? 'Edit Employee Details' : 'Add New Plant Employee'}
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
                    Employee ID Code
                  </label>
                  <input
                    type="text"
                    name="employeeCode"
                    value={formik.values.employeeCode}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  />
                  {formik.touched.employeeCode && formik.errors.employeeCode && (
                    <div className="text-[10px] text-rose-500 mt-0.5">{formik.errors.employeeCode}</div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="e.g. Ramesh Singh"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  />
                  {formik.touched.fullName && formik.errors.fullName && (
                    <div className="text-[10px] text-rose-500 mt-0.5">{formik.errors.fullName}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formik.values.department}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="Production">Production</option>
                    <option value="Assembly Line">Assembly Line</option>
                    <option value="Quality Control">Quality Control</option>
                    <option value="Packaging & Warehouse">Packaging & Warehouse</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Management">Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    System Role
                  </label>
                  <select
                    name="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="OPERATOR">Operator</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="+91 98765 00000"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
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
                  {editingEmployee ? 'Save Changes' : 'Create Employee'}
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
            <h3 className="text-base font-bold text-slate-900 mb-1">Confirm Removal</h3>
            <p className="text-xs text-slate-500 mb-5">
              Are you sure you want to remove this employee? This action cannot be undone.
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

export default EmployeesPage;
