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
      login: (username, token, role) => {
        // Сохраняем роль отдельно в localStorage
        localStorage.setItem('user-role', role);
        set({ user: { username, token, role } });
      },
      logout: () => {
        // Удаляем роль при выходе
        localStorage.removeItem('user-role');
        localStorage.removeItem('auth-storage');
        set({ user: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Дополнительная функция для быстрого доступа к роли
export const getUserRole = (): 'admin' | 'lector' | 'student' | null => {
  return localStorage.getItem('user-role') as 'admin' | 'lector' | 'student' | null;
};