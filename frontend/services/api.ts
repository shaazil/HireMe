import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Attach JWT token from localStorage as fallback
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // We now primarily use httpOnly cookies, but keep fallback
    const token = localStorage.getItem("hireme_token");
    if (token) {
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        // Fallback if headers is a plain object
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("hireme_token");
      localStorage.removeItem("hireme_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
