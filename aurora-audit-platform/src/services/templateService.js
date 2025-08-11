import api from '../api/client';

export const templateService = {
  getAll: async () => {
    try {
      const response = await api.get('/templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/templates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching template:', error);
      return null;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/templates', data);
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/templates/${id}`, data);
      return response.data;
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
