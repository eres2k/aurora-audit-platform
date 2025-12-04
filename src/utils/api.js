// API utility for server-side storage operations
import netlifyIdentity from 'netlify-identity-widget';

const API_BASE = '/.netlify/functions';

// Get the current user's JWT token for authenticated requests
// Uses user.jwt() which returns a Promise and refreshes the token if expired
const getAuthHeaders = async () => {
  const user = netlifyIdentity.currentUser();
  if (!user) {
    return {};
  }

  try {
    // Get a fresh JWT token (automatically refreshes if expired)
    const token = await user.jwt();
    return {
      'Authorization': `Bearer ${token}`,
    };
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return {};
  }
};

// Generic API request handler with retry logic
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE}/${endpoint}`;

  // Get auth headers (async to ensure fresh token)
  const authHeaders = await getAuthHeaders();

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
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

// Users API
export const usersApi = {
  getAll: async () => {
    return apiRequest('users');
  },

  getById: async (userId) => {
    return apiRequest(`users?id=${userId}`);
  },

  register: async (userData) => {
    return apiRequest('users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (userId, updates) => {
    return apiRequest('users', {
      method: 'PUT',
      body: JSON.stringify({ id: userId, ...updates }),
    });
  },

  delete: async (userId) => {
    return apiRequest('users', {
      method: 'DELETE',
      body: JSON.stringify({ id: userId }),
    });
  },
};

// AI API - Gemini multimodal capabilities
export const aiApi = {
  /**
   * Generate an executive summary for an audit using AI
   * @param {Object} auditData - The audit object
   * @param {Object} templateData - The template object (optional, for better context)
   * @returns {Promise<Object>} AI-generated summary with risks and recommendations
   */
  summarizeAudit: async (auditData, templateData = null) => {
    return apiRequest('ai', {
      method: 'POST',
      body: JSON.stringify({
        action: 'summarize',
        audit: auditData,
        template: templateData,
      }),
    });
  },

  /**
   * Analyze an image for safety compliance using AI vision
   * @param {string} imageBase64 - Base64 encoded image (can include data URL prefix)
   * @param {string} question - The context/question being inspected (optional)
   * @returns {Promise<Object>} AI analysis with hazard detection and recommendations
   */
  analyzeImage: async (imageBase64, question = null) => {
    return apiRequest('ai', {
      method: 'POST',
      body: JSON.stringify({
        action: 'analyze_image',
        imageBase64: imageBase64,
        question: question,
      }),
    });
  },

  /**
   * Generate an audit template from a text description
   * @param {string} prompt - Description of the desired audit template
   * @param {string} category - Template category (Safety, Quality, Compliance, Operations)
   * @returns {Promise<Object>} AI-generated template JSON
   */
  generateTemplate: async (prompt, category = 'Safety') => {
    return apiRequest('ai', {
      method: 'POST',
      body: JSON.stringify({
        action: 'generate_template',
        prompt: prompt,
        category: category,
      }),
    });
  },

  /**
   * Extract an audit template from an image of a paper form
   * @param {string} imageBase64 - Base64 encoded image of the paper form
   * @returns {Promise<Object>} AI-extracted template JSON
   */
  imageToTemplate: async (imageBase64) => {
    return apiRequest('ai', {
      method: 'POST',
      body: JSON.stringify({
        action: 'image_to_template',
        imageBase64: imageBase64,
      }),
    });
  },

  /**
   * Process a voice note transcript and extract structured data
   * @param {string} transcript - The transcribed voice note text
   * @param {string} questionContext - The current audit question context (optional)
   * @returns {Promise<Object>} Structured data with cleaned note, status suggestion, etc.
   */
  processVoiceNote: async (transcript, questionContext = '') => {
    return apiRequest('ai', {
      method: 'POST',
      body: JSON.stringify({
        action: 'process_voice_note',
        transcript: transcript,
        questionContext: questionContext,
      }),
    });
  },

  /**
   * Ask the policy compliance chatbot a question
   * @param {string} question - The user's question about safety policies
   * @param {Array} conversationHistory - Previous messages for context [{role, content}]
   * @returns {Promise<Object>} AI response with answer, sources, and related topics
   */
  policyChat: async (question, conversationHistory = []) => {
    return apiRequest('ai', {
      method: 'POST',
      body: JSON.stringify({
        action: 'policy_chat',
        question: question,
        conversationHistory: conversationHistory,
      }),
    });
  },

  /**
   * Generate detailed AI insights for PDF export
   * @param {Object} auditData - The completed audit data
   * @param {Object} templateData - The template for context
   * @returns {Promise<Object>} Structured insights with summary, findings, recommendations, risks
   */
  generatePDFInsights: async (auditData, templateData = null) => {
    return apiRequest('ai', {
      method: 'POST',
      body: JSON.stringify({
        action: 'generate_pdf_insights',
        audit: auditData,
        template: templateData,
      }),
    });
  },
};

export default {
  audits: auditsApi,
  templates: templatesApi,
  actions: actionsApi,
  users: usersApi,
  ai: aiApi,
};
