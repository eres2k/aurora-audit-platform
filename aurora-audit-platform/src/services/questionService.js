import api from '../api/client';

export const questionService = {
  getAll: async () => {
    try {
      const response = await api.get('/questions');
      return response.data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/questions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching question:', error);
      return null;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/questions', data);
      return response.data;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/questions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/questions/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting question:', error);
      return false;
    }
  },

  importFromExcel: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/questions/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing questions:', error);
      throw error;
    }
  },

  exportToExcel: async () => {
    try {
      const response = await api.get('/questions/export', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting questions:', error);
      throw error;
    }
  },
};
