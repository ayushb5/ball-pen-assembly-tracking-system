import api from './api';

const workstationService = {
  getAll: async () => {
    return await api.get('/workstations');
  },

  getById: async (id) => {
    return await api.get(`/workstations/${id}`);
  },

  create: async (data) => {
    return await api.post('/workstations', data);
  },

  update: async (id, data) => {
    return await api.put(`/workstations/${id}`, data);
  },

  updateStatus: async (id, status) => {
    return await api.patch(`/workstations/${id}/status?status=${status}`);
  },

  assign: async (id, assignData) => {
    return await api.post(`/workstations/${id}/assign`, assignData);
  },

  delete: async (id) => {
    return await api.delete(`/workstations/${id}`);
  },
};

export default workstationService;
