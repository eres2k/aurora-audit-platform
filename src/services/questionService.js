import api from '../api/client';

export const questionService = {
  getAll: async () => {
    try {
      return await api.get('/questions');
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      return await api.get(`/questions/${id}`);
    } catch (error) {
      console.error('Error fetching question:', error);
      return null;
    }
  },

  create: async (data) => {
    try {
      return await api.post('/questions', data);
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      return await api.put(`/questions/${id}`, data);
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
};
