import api from './api';

const qualityService = {
  getAll: async () => {
    return await api.get('/quality-checks');
  },

  getById: async (id) => {
    return await api.get(`/quality-checks/${id}`);
  },

  getByOrderId: async (orderId) => {
    return await api.get(`/quality-checks/order/${orderId}`);
  },

  create: async (data) => {
    return await api.post('/quality-checks', data);
  },

  update: async (id, data) => {
    return await api.put(`/quality-checks/${id}`, data);
  },

  delete: async (id) => {
    return await api.delete(`/quality-checks/${id}`);
  },
};

export default qualityService;
