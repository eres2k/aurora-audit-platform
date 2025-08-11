import api from '../api/client';

export const fileService = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  uploadMultiple: async (files) => {
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
  },

  get: async (id) => {
    const response = await api.get(`/files/${id}`);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/files/${id}`);
  },
};
