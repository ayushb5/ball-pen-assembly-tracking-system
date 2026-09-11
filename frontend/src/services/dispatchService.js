import api from './api';

const dispatchService = {
  getAll: async () => {
    return await api.get('/dispatch');
  },

  getById: async (id) => {
    return await api.get(`/dispatch/${id}`);
  },

  getByCustomerId: async (customerId) => {
    return await api.get(`/dispatch/customer/${customerId}`);
  },

  create: async (data) => {
    return await api.post('/dispatch', data);
  },

  update: async (id, data) => {
    return await api.put(`/dispatch/${id}`, data);
  },

  updateStatus: async (id, status) => {
    return await api.patch(`/dispatch/${id}/status?status=${status}`);
  },

  delete: async (id) => {
    return await api.delete(`/dispatch/${id}`);
  },
};

export default dispatchService;
