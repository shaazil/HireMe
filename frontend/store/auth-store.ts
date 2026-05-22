import { create } from "zustand";

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
  company?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

    setAuth: (user, token) => {
    localStorage.setItem("hireme_token", token);
    localStorage.setItem("hireme_user", JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    try {
      const api = (await import("@/services/api")).default;
      await api.post("/auth/logout");
    } catch (e) {} // ignore if it fails
    localStorage.removeItem("hireme_token");
    localStorage.removeItem("hireme_user");
    set({ user: null, token: null, isAuthenticated: false });
  },

  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("hireme_token");
    const userStr = localStorage.getItem("hireme_user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch {
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  },
}));
