import api from './api';

const employeeService = {
  getAll: async () => {
    return await api.get('/employees');
  },

  getById: async (id) => {
    return await api.get(`/employees/${id}`);
  },

  create: async (employeeData) => {
    return await api.post('/employees', employeeData);
  },

  update: async (id, employeeData) => {
    return await api.put(`/employees/${id}`, employeeData);
  },

  delete: async (id) => {
    return await api.delete(`/employees/${id}`);
  },

  toggleStatus: async (id) => {
    return await api.patch(`/employees/${id}/status`);
  },
};

export default employeeService;
