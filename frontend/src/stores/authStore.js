// Demo-mode auth — no real backend needed. Name + grade stored in localStorage.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login(name, grade = 4, role = 'STUDENT') {
        const user = { id: `demo-${Date.now()}`, name, grade: Number(grade), role };
        set({ user, isAuthenticated: true });
        return { success: true };
      },

      logout() {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);
