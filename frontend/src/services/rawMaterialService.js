import api from './api';

const rawMaterialService = {
  getAll: async () => {
    return await api.get('/raw-materials');
  },

  getById: async (id) => {
    return await api.get(`/raw-materials/${id}`);
  },

  getLowStock: async () => {
    return await api.get('/raw-materials/low-stock');
  },

  create: async (materialData) => {
    return await api.post('/raw-materials', materialData);
  },

  update: async (id, materialData) => {
    return await api.put(`/raw-materials/${id}`, materialData);
  },

  delete: async (id) => {
    return await api.delete(`/raw-materials/${id}`);
  },

  adjustStock: async (id, delta) => {
    return await api.patch(`/raw-materials/${id}/adjust-stock?delta=${delta}`);
  },
};

export default rawMaterialService;
