import api from '../api/client';

export const templateService = {
  getAll: async () => {
    const response = await api.get('/templates');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/templates', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/templates/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/templates/${id}`);
  },
};
