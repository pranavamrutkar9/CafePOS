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

// Mock endpoints to keep the UI working seamlessly
mockApi.onPost("/auth/login").reply((config) => {
  const { email } = JSON.parse(config.data);
  if (email === "error@test.com") {
    return [401, { message: "Invalid credentials" }];
  }
  return [200, {
    token: "mock-jwt-token-12345",
    user: { id: "u1", name: "Admin", email, role: "Employee" }
  }];
});

mockApi.onPost("/auth/signup").reply(201, {
  token: "mock-jwt-token-12345",
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

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      } else {
        toast.error(error.response.data?.message || "An error occurred");
      }
    } else {
      toast.error("Network Error. Please check your connection.");
    }
    return Promise.reject(error);
  }
);

export default api;
