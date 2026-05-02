import api from './api';

export const authService = {
  async login(credentials: any) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.accessToken) {
      localStorage.setItem('ms_token', response.data.accessToken);
      
      // Fetch user data after login
      try {
        const userRes = await api.get('/users/me');
        localStorage.setItem('ms_user', JSON.stringify(userRes.data));
      } catch (err) {
        console.error('Failed to fetch user profile', err);
      }
    }
    return response.data;
  },

  async register(data: any) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    }
    const keysToRemove = ['ms_token', 'ms_user', 'token', 'accessToken', 'ms_auth_token', 'user'];
    keysToRemove.forEach(key => localStorage.removeItem(key));
  },

  getCurrentUser() {
    const user = localStorage.getItem('ms_user');
    return user ? JSON.parse(user) : null;
  }
};
