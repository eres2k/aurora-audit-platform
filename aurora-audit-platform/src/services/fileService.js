import api from '../api/client';

export const fileService = {
  upload: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  uploadMultiple: async (files) => {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });
      
      const response = await api.post('/files/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  },

  get: async (id) => {
    try {
      const response = await api.get(`/files/${id}`);
      return response.data;
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

  getUrl: (id) => {
    return `${process.env.REACT_APP_API_URL || '/.netlify/functions'}/files/${id}`;
  },
};
