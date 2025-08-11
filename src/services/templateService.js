import api from '../api/client';

export const templateService = {
  getAll: async () => {
    try {
      return await api.get('/templates');
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      return await api.get(`/templates/${id}`);
    } catch (error) {
      console.error('Error fetching template:', error);
      return null;
    }
  },

  create: async (data) => {
    try {
      return await api.post('/templates', data);
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      return await api.put(`/templates/${id}`, data);
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/templates/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      return false;
    }
  },
};
