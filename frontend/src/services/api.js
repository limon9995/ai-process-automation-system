const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.detail || 'API request failed');
  }

  return data;
}

export const api = {
  getStats: () => request('/api/dashboard/stats'),

  submitMessage: (text, source = 'manual') =>
    request('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ text, source })
    }),

  getMessages: (filters = {}) => {
    const query = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') query.set(key, value);
    });

    const suffix = query.toString() ? `?${query.toString()}` : '';
    return request(`/api/messages${suffix}`);
  },

  retryMessage: (id) =>
    request(`/api/messages/retry/${id}`, { method: 'POST' }),

  retryReply: (id) =>
    request(`/api/messages/${id}/retry-reply`, { method: 'POST' }),

  updateExtractedData: (id, extractedData) =>
    request(`/api/messages/${id}/extracted-data`, {
      method: 'PUT',
      body: JSON.stringify({ extractedData })
    }),

  getOrders: (status = 'all') =>
    request(`/api/orders${status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : ''}`),

  updateOrderStatus: (id, status) =>
    request(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),

  getSupportTickets: () => request('/api/support-tickets'),

  updateSupportStatus: (id, status) =>
    request(`/api/support-tickets/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),

  getQueryCases: (status = 'all') =>
    request(`/api/query-cases${status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : ''}`),

  updateQueryStatus: (id, status) =>
    request(`/api/query-cases/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),

  getLogs: () => request('/api/logs'),
  getGmailStatus: () => request('/api/gmail/status'),
  fetchGmailNow: () => request('/api/gmail/fetch-now', { method: 'POST' }),

  sendWebhookMessage: (payload) =>
    request('/api/webhook/incoming-message', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};