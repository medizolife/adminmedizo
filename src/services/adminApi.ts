import axios from 'axios';

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    const url = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  return 'https://medizoserver.medizolife.workers.dev/api';
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
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: automatically redirect to /login if 401 Unauthorized occurs
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

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
  },

  // Get complete 360-degree user profile, graph analytics, and audit timeline
  getUserDetails: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}/details`);
    return response.data;
  },

  // Get complete platform dataset in a single high-speed bulk payload for instant client caching
  getBootstrapData: async () => {
    const response = await api.get('/admin/bootstrap');
    return response.data;
  },

  // Get cross-platform clinical, epidemiological, revenue, and operational analytics
  getComprehensiveAnalytics: async (range: string = '30d') => {
    const response = await api.get('/admin/analytics/comprehensive', {
      params: { range }
    });
    return response.data;
  },

  // Update home care request status
  updateHomeCareStatus: async (requestId: string, status: string) => {
    const response = await api.patch(`/admin/home-care/${requestId}/status`, { status });
    return response.data;
  },

  // Assign nurse to home care request
  assignNurseToHomeCare: async (requestId: string, nurseId: string) => {
    const response = await api.post(`/admin/home-care/${requestId}/assign-nurse`, { nurseId });
    return response.data;
  },

  // Update referral status
  updateReferralStatus: async (referralId: string, status: string, responseNotes?: string) => {
    const response = await api.patch(`/admin/referrals/${referralId}/status`, { status, responseNotes });
    return response.data;
  },

  // Update bill status
  updateBillStatus: async (billId: string, status: string, paymentData?: any) => {
    const response = await api.patch(`/admin/billing/${billId}/status`, { status, ...(paymentData || {}) });
    return response.data;
  },

  // Update nurse-patient assignment status
  updateAssignmentStatus: async (assignmentId: string, status: string) => {
    const response = await api.patch(`/admin/assignments/nurse/${assignmentId}/status`, { status });
    return response.data;
  }
};

export default api;
