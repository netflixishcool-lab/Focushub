import { create } from 'zustand';
import API, { setToken, clearToken } from './api.js';

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await API.post('/auth/login', { username, password });
      setToken(response.data.token);
      set({
        user: response.data.user,
        isLoading: false
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Login failed';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await API.post('/auth/register', {
        username,
        email,
        password
      });
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Registration failed';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    clearToken();
    set({ user: null });
  },

  verify: async () => {
    try {
      const response = await API.get('/auth/verify');
      set({ user: response.data.user });
      return response.data.user;
    } catch (error) {
      set({ user: null });
      return null;
    }
  }
}));

export const useAdminStore = create((set) => ({
  stats: null,
  users: [],
  licenses: [],
  isLoading: false,
  error: null,

  getStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await API.get('/api/admin/stats');
      set({ stats: response.data.stats, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error, isLoading: false });
    }
  },

  getUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await API.get('/api/admin/users');
      set({ users: response.data.users, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error, isLoading: false });
    }
  },

  getLicenses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await API.get('/api/license/keys');
      set({ licenses: response.data.keys, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error, isLoading: false });
    }
  },

  createLicense: async (productName, expiresInDays) => {
    try {
      const response = await API.post('/api/license/create', {
        product_name: productName,
        expires_in_days: expiresInDays,
        quantity: 1
      });
      await set(state => ({ licenses: [...state.licenses, ...response.data.keys] }));
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}));

export const useLicenseStore = create((set) => ({
  myHWIDs: [],
  isLoading: false,
  error: null,

  getHWIDs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await API.get('/api/hwid/list');
      set({ myHWIDs: response.data.hwids, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error, isLoading: false });
    }
  },

  activateLicense: async (licenseKey, hwid) => {
    try {
      const response = await API.post('/api/license/activate', {
        license_key: licenseKey,
        hwid
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}));
