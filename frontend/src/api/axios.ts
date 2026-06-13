import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Mock Adapter for demonstration without backend
export const mockApi = new MockAdapter(api, { delayResponse: 500 });
if (process.env.NEXT_PUBLIC_USE_MOCK !== "true") {
  mockApi.restore();
}

// Mock endpoints to keep the UI working seamlessly
mockApi.onPost("/auth/login").reply((config) => {
  const { email } = JSON.parse(config.data);
  if (email === "error@test.com") {
    return [401, { message: "Invalid credentials" }];
  }
  return [200, {
    accessToken: "mock-jwt-token-12345",
    refreshToken: "mock-refresh-token-67890",
    user: { id: "u1", name: "Admin", email, role: "Employee" }
  }];
});

mockApi.onPost("/auth/signup").reply(201, {
  accessToken: "mock-jwt-token-12345",
  refreshToken: "mock-refresh-token-67890",
  user: { id: "u2", name: "New User", email: "new@test.com", role: "User" }
});

mockApi.onPost("/sessions").reply(200, { sessionId: "sess-999" });
mockApi.onPatch(/\/sessions\/.+/).reply(200, { success: true });

// Fallback for any other request
mockApi.onAny().reply(200, { success: true, data: [] });

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor variables for queuing requests while refreshing
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Catch 401 and try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
          
          const newAccessToken = data.accessToken;
          const newRefreshToken = data.refreshToken;
          
          localStorage.setItem("token", newAccessToken);
          if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);
          
          api.defaults.headers.common["Authorization"] = "Bearer " + newAccessToken;
          originalRequest.headers.Authorization = "Bearer " + newAccessToken;
          
          processQueue(null, newAccessToken);
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      
      // If no refresh token or logic bypassed
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (error.response && error.response.status !== 401) {
      toast.error(error.response.data?.message || "An error occurred");
    } else if (!error.response) {
      toast.error("Network Error. Please check your connection.");
    }
    return Promise.reject(error);
  }
);

export default api;
