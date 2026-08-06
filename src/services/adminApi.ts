import axios from 'axios';

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    const url = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  return 'https://medizoserver.vercel.app/api';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach x-auth-token
api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['x-auth-token'] = token;
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

export const adminApi = {
  // Login as admin
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Get system statistics
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Get user roster by role (doctor, patient, pharmacist) with search & status filter
  getUsers: async (role?: 'doctor' | 'patient' | 'pharmacist', search?: string, status?: string) => {
    const response = await api.get('/admin/users', {
      params: { role, search, status }
    });
    return response.data;
  },

  // Toggle or update account status (active <-> deactivated)
  toggleUserStatus: async (userId: string, newStatus: 'active' | 'deactivated') => {
    const response = await api.put(`/admin/users/${userId}/status`, { status: newStatus });
    return response.data;
  },

  // Permanently delete a user account
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Create new user (e.g. pharmacist, doctor, patient)
  createUser: async (userData: any) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  // Get prescription transactions audit log
  getPrescriptionTransactions: async () => {
    const response = await api.get('/admin/prescriptions');
    return response.data;
  }
};

export default api;
