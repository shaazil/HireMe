import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("hireme_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses globally — but NOT on auth endpoints
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const url = error.config?.url || "";
      // Don't auto-logout on login/register failures — those 401s are expected
      const isAuthRoute = url.includes("/auth/login") || url.includes("/auth/register");
      if (!isAuthRoute) {
        localStorage.removeItem("hireme_token");
        localStorage.removeItem("hireme_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
