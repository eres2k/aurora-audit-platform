import api from '../api/client';

export const questionService = {
  getAll: async () => {
    const response = await api.get('/questions');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/questions', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/questions/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/questions/${id}`);
  },

  importFromExcel: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/questions/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  exportToExcel: async () => {
    const response = await api.get('/questions/export', {
      responseType: 'blob',
    });
    return response.data;
  },
};
