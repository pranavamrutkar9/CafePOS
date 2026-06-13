// Basic fetch wrapper for API calls with JWT injection
const API_BASE_URL = 'http://localhost:5000/api';

export const apiClient = {
  get: async (endpoint: string) => {
    return request(endpoint, { method: 'GET' });
  },
  post: async (endpoint: string, data?: any) => {
    return request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  put: async (endpoint: string, data?: any) => {
    return request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (endpoint: string) => {
    return request(endpoint, { method: 'DELETE' });
  },
};

async function request(endpoint: string, options: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API error' }));
    throw new Error(error.message || `Error ${response.status}`);
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204) return null;

  return response.json();
}
