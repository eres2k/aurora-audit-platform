import axios from 'axios';
import netlifyIdentity from 'netlify-identity-widget';

const API_URL = process.env.REACT_APP_API_URL || '/.netlify/functions';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
client.interceptors.request.use(
  (config) => {
    const user = netlifyIdentity.currentUser();
    if (user?.token?.access_token) {
      config.headers.Authorization = `Bearer ${user.token.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      netlifyIdentity.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
