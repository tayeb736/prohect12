import api from './api';

export const productService = {
  async getAll(filters?: any) {
    const response = await api.get('/products', { params: filters });
    return response.data;
  },

  async getOne(id: string) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/products', data);
    return response.data;
  },

  async getCategories() {
    const response = await api.get('/categories');
    return response.data;
  }
};
