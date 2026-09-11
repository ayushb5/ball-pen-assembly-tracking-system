import api from './api';

const reportService = {
  getExecutiveSummary: async () => {
    return await api.get('/reports/executive-summary');
  },

  getProductionReport: async () => {
    return await api.get('/reports/production');
  },

  getQualityReport: async () => {
    return await api.get('/reports/quality');
  },

  getInventoryReport: async () => {
    return await api.get('/reports/inventory');
  },

  getDispatchReport: async () => {
    return await api.get('/reports/dispatch');
  },
};

export default reportService;
