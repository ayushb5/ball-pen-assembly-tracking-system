import api from './api';

const authService = {
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },

  logout: () => {
    localStorage.removeItem('ballpen_token');
    localStorage.removeItem('ballpen_user');
  },
};

export default authService;
