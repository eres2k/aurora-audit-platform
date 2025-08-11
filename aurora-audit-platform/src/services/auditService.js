import api from '../api/client';

export const auditService = {
  getAll: async () => {
    const response = await api.get('/audits');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/audits/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/audits', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/audits/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/audits/${id}`);
  },

  getStats: async () => {
    const response = await api.get('/audits/stats');
    return response.data;
  },

  exportToPdf: async (id) => {
    const response = await api.get(`/audits/${id}/export/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
