import api from './api';

const customerService = {
  getAll: async () => {
    return await api.get('/customers');
  },

  getById: async (id) => {
    return await api.get(`/customers/${id}`);
  },

  create: async (customerData) => {
    return await api.post('/customers', customerData);
  },

  update: async (id, customerData) => {
    return await api.put(`/customers/${id}`, customerData);
  },

  delete: async (id) => {
    return await api.delete(`/customers/${id}`);
  },

  toggleStatus: async (id) => {
    return await api.patch(`/customers/${id}/status`);
  },
};

export default customerService;
