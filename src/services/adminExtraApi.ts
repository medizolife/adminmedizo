import api from './adminApi';

export const adminExtraApi = {
  // Nurses roster & affiliations
  getNurses: async () => {
    const response = await api.get('/admin/nurses');
    return response.data;
  },

  getAffiliations: async () => {
    const response = await api.get('/admin/affiliations');
    return response.data;
  },

  createAffiliation: async (data: { nurseId: string; doctorId: string; affiliationType?: string; relationshipType?: string; notes?: string }) => {
    const response = await api.post('/admin/affiliations', data);
    return response.data;
  },

  // Assignments matrix (Doctor-Patient, Nurse-Patient)
  getAssignmentsOverview: async () => {
    const response = await api.get('/admin/assignments-overview');
    return response.data;
  },

  // Doctor referrals oversight
  getReferralsOverview: async () => {
    const response = await api.get('/admin/referrals-overview');
    return response.data;
  },

  // Home care requests oversight
  getHomeCareOverview: async () => {
    const response = await api.get('/admin/home-care-overview');
    return response.data;
  },

  // Billing & invoice oversight
  getBillingOverview: async () => {
    const response = await api.get('/admin/billing-overview');
    return response.data;
  },

  // Schedules overview
  getSchedulesOverview: async () => {
    const response = await api.get('/admin/schedules-overview');
    return response.data;
  }
};
