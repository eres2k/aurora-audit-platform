import api from '../api/client';

export const fileService = {
  upload: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || '/.netlify/functions'}/files/upload`, {
        method: 'POST',
        body: formData,
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  get: async (id) => {
    try {
      return await api.get(`/files/${id}`);
    } catch (error) {
      console.error('Error fetching file:', error);
      return null;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/files/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  },
};
