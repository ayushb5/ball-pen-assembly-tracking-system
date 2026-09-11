import api from './api';

const productService = {
  getAll: async () => {
    return await api.get('/products');
  },

  getById: async (id) => {
    return await api.get(`/products/${id}`);
  },

  create: async (productData) => {
    return await api.post('/products', productData);
  },

  update: async (id, productData) => {
    return await api.put(`/products/${id}`, productData);
  },

  delete: async (id) => {
    return await api.delete(`/products/${id}`);
  },

  toggleStatus: async (id) => {
    return await api.patch(`/products/${id}/status`);
  },
};

export default productService;
