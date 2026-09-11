import api from './api';

const packagingService = {
  getAll: async () => {
    return await api.get('/packaging');
  },

  getById: async (id) => {
    return await api.get(`/packaging/${id}`);
  },

  getByOrderId: async (orderId) => {
    return await api.get(`/packaging/order/${orderId}`);
  },

  create: async (data) => {
    return await api.post('/packaging', data);
  },

  update: async (id, data) => {
    return await api.put(`/packaging/${id}`, data);
  },

  delete: async (id) => {
    return await api.delete(`/packaging/${id}`);
  },
};

export default packagingService;
