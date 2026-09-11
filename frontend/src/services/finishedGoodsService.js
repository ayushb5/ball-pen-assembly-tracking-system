import api from './api';

const finishedGoodsService = {
  getAll: async () => {
    return await api.get('/finished-goods');
  },

  getById: async (id) => {
    return await api.get(`/finished-goods/${id}`);
  },

  getReadyForDispatch: async () => {
    return await api.get('/finished-goods/ready');
  },

  create: async (data) => {
    return await api.post('/finished-goods', data);
  },

  update: async (id, data) => {
    return await api.put(`/finished-goods/${id}`, data);
  },

  toggleDispatchReady: async (id) => {
    return await api.patch(`/finished-goods/${id}/ready`);
  },

  updateLocation: async (id, location) => {
    return await api.patch(`/finished-goods/${id}/location?location=${encodeURIComponent(location)}`);
  },

  delete: async (id) => {
    return await api.delete(`/finished-goods/${id}`);
  },
};

export default finishedGoodsService;
