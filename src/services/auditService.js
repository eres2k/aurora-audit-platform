import api from '../api/client';

export const auditService = {
  getAll: async () => {
    try {
      return await api.get('/audits');
    } catch (error) {
      console.error('Error fetching audits:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      return await api.get(`/audits/${id}`);
    } catch (error) {
      console.error('Error fetching audit:', error);
      return null;
    }
  },

  create: async (data) => {
    try {
      return await api.post('/audits', data);
    } catch (error) {
      console.error('Error creating audit:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      return await api.put(`/audits/${id}`, data);
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
      return await api.get('/audits/stats');
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
};
