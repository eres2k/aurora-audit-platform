// API utility for server-side storage operations
import netlifyIdentity from 'netlify-identity-widget';

const API_BASE = '/.netlify/functions';

// Get the current user's JWT token for authenticated requests
const getAuthHeaders = () => {
  const user = netlifyIdentity.currentUser();
  if (!user) {
    return {};
  }

  return {
    'Authorization': `Bearer ${user.token.access_token}`,
  };
};

// Generic API request handler with retry logic
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE}/${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Audits API
export const auditsApi = {
  getAll: async (stationId) => {
    const params = stationId ? `?station=${stationId}` : '';
    return apiRequest(`audits${params}`);
  },

  getById: async (auditId) => {
    return apiRequest(`audits?id=${auditId}`);
  },

  create: async (audit) => {
    return apiRequest('audits', {
      method: 'POST',
      body: JSON.stringify(audit),
    });
  },

  update: async (auditId, updates) => {
    return apiRequest('audits', {
      method: 'PUT',
      body: JSON.stringify({ id: auditId, ...updates }),
    });
  },

  delete: async (auditId) => {
    return apiRequest('audits', {
      method: 'DELETE',
      body: JSON.stringify({ id: auditId }),
    });
  },
};

// Templates API
export const templatesApi = {
  getAll: async () => {
    return apiRequest('templates');
  },

  getById: async (templateId) => {
    return apiRequest(`templates?id=${templateId}`);
  },

  create: async (template) => {
    return apiRequest('templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  },

  update: async (templateId, updates) => {
    return apiRequest('templates', {
      method: 'PUT',
      body: JSON.stringify({ id: templateId, ...updates }),
    });
  },

  delete: async (templateId) => {
    return apiRequest('templates', {
      method: 'DELETE',
      body: JSON.stringify({ id: templateId }),
    });
  },
};

// Actions API
export const actionsApi = {
  getAll: async (stationId) => {
    const params = stationId ? `?station=${stationId}` : '';
    return apiRequest(`actions${params}`);
  },

  getById: async (actionId) => {
    return apiRequest(`actions?id=${actionId}`);
  },

  create: async (action) => {
    return apiRequest('actions', {
      method: 'POST',
      body: JSON.stringify(action),
    });
  },

  createBulk: async (actions) => {
    return apiRequest('actions', {
      method: 'POST',
      body: JSON.stringify({ bulk: true, actions }),
    });
  },

  update: async (actionId, updates) => {
    return apiRequest('actions', {
      method: 'PUT',
      body: JSON.stringify({ id: actionId, ...updates }),
    });
  },

  delete: async (actionId) => {
    return apiRequest('actions', {
      method: 'DELETE',
      body: JSON.stringify({ id: actionId }),
    });
  },
};

export default {
  audits: auditsApi,
  templates: templatesApi,
  actions: actionsApi,
};
