import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      vendor: null,
      token: null,
      isAuthenticated: false,
      userType: null, // 'user' or 'vendor'

      setAuth: (data) => {
        set({
          user: data.user || null,
          vendor: data.vendor || null,
          token: data.token,
          isAuthenticated: true,
          userType: data.user ? 'user' : 'vendor',
        });
      },

      logout: () => {
        set({
          user: null,
          vendor: null,
          token: null,
          isAuthenticated: false,
          userType: null,
        });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      updateVendor: (vendorData) => {
        set((state) => ({
          vendor: state.vendor ? { ...state.vendor, ...vendorData } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);

// Made with Bob
