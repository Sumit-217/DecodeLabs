/**
 * DecodeLabs Industrial Training — Project 4: Frontend & Backend Integration
 * File: public/js/api.js
 * Description: Pure Network Communication Layer.
 *              Encapsulates native fetch() with timeouts, error translation,
 *              response.ok validation, and lifecycle stage telemetry callbacks.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ApiClient = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Base API configuration
  const API_CONFIG = {
    BASE_URL: '/api',
    TIMEOUT_MS: 8000,
    HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  /**
   * Custom API Error Class
   */
  class ApiError extends Error {
    constructor(message, status = 0, data = null, isNetwork = false, isTimeout = false) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.data = data;
      this.isNetwork = isNetwork;
      this.isTimeout = isTimeout;
    }
  }

  // Telemetry event subscriber for the 6-stage IPO lifecycle
  let stageChangeCallback = null;

  function notifyStage(stage, details = {}) {
    if (typeof stageChangeCallback === 'function') {
      try {
        stageChangeCallback(stage, details);
      } catch (err) {
        console.warn('[ApiClient] Stage callback error:', err);
      }
    }
  }

  /**
   * Core request wrapper with AbortController timeout and error interception
   */
  async function request(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || API_CONFIG.TIMEOUT_MS);

    const headers = {
      ...API_CONFIG.HEADERS,
      ...(options.headers || {})
    };

    const fetchOptions = {
      method: options.method || 'GET',
      headers,
      signal: controller.signal
    };

    if (options.body && fetchOptions.method !== 'GET') {
      fetchOptions.body = JSON.stringify(options.body);
    }

    try {
      // Stage 2: HTTP Request Sent
      notifyStage('REQUEST_SENT', { url, method: fetchOptions.method });

      // Stage 3: Server Processing (Simulated timing hook for visualization)
      setTimeout(() => notifyStage('SERVER_PROCESSING', { url }), 120);

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      // Stage 4: Database interaction completed on server
      notifyStage('DATABASE_PERSISTED', { status: response.status });

      // Parse JSON response safely
      let responseData = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        responseData = text ? { message: text } : null;
      }

      // Stage 5: Response Received
      notifyStage('RESPONSE_RECEIVED', { status: response.status, ok: response.ok });

      // Handle non-2xx HTTP status codes
      if (!response.ok) {
        const errorMsg = (responseData && responseData.error && responseData.error.message) ||
                         (responseData && responseData.message) ||
                         `HTTP Error ${response.status}: ${response.statusText}`;
        
        throw new ApiError(errorMsg, response.status, responseData);
      }

      return responseData;
    } catch (err) {
      clearTimeout(timeoutId);

      // Stage 5 error response notification
      notifyStage('RESPONSE_ERROR', { error: err.message });

      if (err.name === 'AbortError') {
        throw new ApiError('Request timed out after 8 seconds. Please check your network.', 408, null, false, true);
      } else if (err instanceof ApiError) {
        throw err;
      } else {
        // Network failure or CORS connection refused
        throw new ApiError('Network connection failed. Unable to reach backend server on port 3002.', 0, null, true, false);
      }
    }
  }

  // Exposed API Methods
  return {
    /**
     * Subscribe to IPO lifecycle stage events
     * Stages: INPUT -> REQUEST_SENT -> SERVER_PROCESSING -> DATABASE_PERSISTED -> RESPONSE_RECEIVED -> DOM_UPDATED
     */
    onStageChange(callback) {
      stageChangeCallback = callback;
    },

    /**
     * System health check
     * GET /api/health
     */
    async checkHealth() {
      return request('/health', { timeoutMs: 3500 });
    },

    /**
     * Fetch interns list with optional filtering query parameters
     * GET /api/interns?search=...&track=...&status=...
     */
    async getInterns(params = {}) {
      const query = new URLSearchParams();
      if (params.search && params.search.trim()) {
        query.append('search', params.search.trim());
      }
      if (params.track && params.track !== 'All') {
        query.append('track', params.track);
      }
      if (params.status && params.status !== 'All') {
        query.append('status', params.status);
      }

      const queryString = query.toString() ? `?${query.toString()}` : '';
      return request(`/interns${queryString}`, { method: 'GET' });
    },

    /**
     * Fetch single intern by ID
     * GET /api/interns/:id
     */
    async getInternById(id) {
      return request(`/interns/${encodeURIComponent(id)}`, { method: 'GET' });
    },

    /**
     * Create new intern
     * POST /api/interns
     */
    async createIntern(internData) {
      notifyStage('INPUT_SUBMITTED', { action: 'create', data: internData });
      return request('/interns', {
        method: 'POST',
        body: internData
      });
    },

    /**
     * Update existing intern
     * PUT /api/interns/:id
     */
    async updateIntern(id, internData) {
      notifyStage('INPUT_SUBMITTED', { action: 'update', id, data: internData });
      return request(`/interns/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: internData
      });
    },

    /**
     * Delete intern
     * DELETE /api/interns/:id
     */
    async deleteIntern(id) {
      notifyStage('INPUT_SUBMITTED', { action: 'delete', id });
      return request(`/interns/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    },

    /**
     * Simulate controlled error scenarios for Diagnostics sandbox
     * GET /api/simulate-error/:type
     */
    async simulateError(type) {
      notifyStage('INPUT_SUBMITTED', { action: 'diagnostics', type });
      
      if (type === 'network') {
        // Direct simulation of network unreachable
        const invalidUrl = 'http://localhost:59999/api/unreachable-endpoint';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        try {
          notifyStage('REQUEST_SENT', { url: invalidUrl, method: 'GET' });
          await fetch(invalidUrl, { signal: controller.signal });
          clearTimeout(timeoutId);
        } catch (err) {
          clearTimeout(timeoutId);
          notifyStage('RESPONSE_ERROR', { error: 'Network failure simulated' });
          throw new ApiError('Simulated Network Error: Target host unreachable or connection refused.', 0, null, true, false);
        }
      } else if (type === 'timeout') {
        // Direct simulation of client-side request timeout abort
        return request('/simulate-error/timeout', { timeoutMs: 1500 });
      }

      return request(`/simulate-error/${encodeURIComponent(type)}`, { method: 'GET' });
    },

    /**
     * Get base URL
     */
    getBaseUrl() {
      return API_CONFIG.BASE_URL;
    }
  };
});
