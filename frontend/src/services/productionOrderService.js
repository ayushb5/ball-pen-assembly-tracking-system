import api from './api';

const productionOrderService = {
  getAll: async () => {
    return await api.get('/production-orders');
  },

  getById: async (id) => {
    return await api.get(`/production-orders/${id}`);
  },

  create: async (orderData) => {
    return await api.post('/production-orders', orderData);
  },

  update: async (id, orderData) => {
    return await api.put(`/production-orders/${id}`, orderData);
  },

  delete: async (id) => {
    return await api.delete(`/production-orders/${id}`);
  },

  updateStatus: async (id, status) => {
    return await api.patch(`/production-orders/${id}/status?status=${status}`);
  },
};

export default productionOrderService;
