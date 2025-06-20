import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: {
    username: string;
    role: 'admin' | 'lector' | 'student';
    token: string;
  } | null;
  login: (username: string, token: string, role: 'admin' | 'lector' | 'student') => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (username, token, role) => set({
        user: { username, token, role }
      }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage', // Ключ для localStorage
    }
  )
);