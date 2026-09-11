import api from './api';

const dashboardService = {
  getStats: async () => {
    return await api.get('/dashboard/stats');
  },
};

export default dashboardService;
