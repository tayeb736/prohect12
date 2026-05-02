import api from './api';

export const storeService = {
  getMyStore: async () => {
    const response = await api.get('/stores/my-store');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/stores', data);
    return response.data;
  },

  update: async (data: any) => {
    const response = await api.patch('/stores/my-store', data);
    return response.data;
  }
};
