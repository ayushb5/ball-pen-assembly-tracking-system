import api from './api';

const assemblyService = {
  getAll: async () => {
    return await api.get('/assembly-tracking');
  },

  getByOrderId: async (orderId) => {
    return await api.get(`/assembly-tracking/order/${orderId}`);
  },

  getById: async (id) => {
    return await api.get(`/assembly-tracking/${id}`);
  },

  updateStage: async (id, stageData) => {
    return await api.put(`/assembly-tracking/${id}`, stageData);
  },

  startStage: async (id, employeeId, remarks) => {
    const params = new URLSearchParams();
    if (employeeId) params.append('employeeId', employeeId);
    if (remarks) params.append('remarks', remarks);
    return await api.post(`/assembly-tracking/${id}/start?${params.toString()}`);
  },

  completeStage: async (id, remarks) => {
    const params = new URLSearchParams();
    if (remarks) params.append('remarks', remarks);
    return await api.post(`/assembly-tracking/${id}/complete?${params.toString()}`);
  },
};

export default assemblyService;
