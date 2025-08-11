import api from '../api/client';

export const auditService = {
  getAll: async () => {
    try {
      const response = await api.get('/audits');
      return response.data;
    } catch (error) {
      console.error('Error fetching audits:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/audits/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit:', error);
      return null;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/audits', data);
      return response.data;
    } catch (error) {
      console.error('Error creating audit:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/audits/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating audit:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/audits/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting audit:', error);
      return false;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/audits/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalAudits: 0,
        inProgress: 0,
        completed: 0,
        templates: 0,
      };
    }
  },

  exportToPdf: async (id) => {
    try {
      const response = await api.get(`/audits/${id}/export/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  },
};
