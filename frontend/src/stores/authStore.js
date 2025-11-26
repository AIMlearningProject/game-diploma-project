import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, token } = response.data;

          set({
            user,
            token,
            isAuthenticated: true,
          });

          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: error.response?.data?.message || error.response?.data?.error || 'Login failed',
          };
        }
      },

      register: async (userData) => {
        try {
          const response = await api.post('/auth/register', userData);
          const { user, token } = response.data;

          set({
            user,
            token,
            isAuthenticated: true,
          });

          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: error.response?.data?.message || error.response?.data?.error || 'Registration failed',
          };
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      fetchCurrentUser: async () => {
        try {
          const response = await api.get('/auth/me');
          set({
            user: response.data,
            isAuthenticated: true,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
