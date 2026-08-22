'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { adminApi } from '@/services/adminApi';
import { adminExtraApi } from '@/services/adminExtraApi';

interface AdminDataContextType {
  doctors: any[];
  nurses: any[];
  patients: any[];
  pharmacists: any[];
  transactions: any[];
  billing: { bills: any[]; metrics: any };
  referrals: any[];
  homeCare: any[];
  assignments: { nurseAssignments: any; doctorAssignments: any };
  affiliations: any[];
  stats: any;
  analyticsData: any;
  userDetailsCache: Record<string, any>;
  isPreloaded: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
  preloadAll: (forceRefresh?: boolean) => Promise<void>;
  refreshSection: (sectionKey: string) => Promise<void>;
  getUserDetailsFast: (userId: string, initialUserData?: any) => Promise<any>;
  fetchAnalytics: (range?: string, forceRefresh?: boolean) => Promise<any>;
  toggleUserStatusLocal: (userId: string, newStatus: 'active' | 'deactivated') => Promise<boolean>;
  deleteUserLocal: (userId: string) => Promise<boolean>;
  updateHomeCareStatusLocal: (requestId: string, status: string) => Promise<boolean>;
  assignNurseToHomeCareLocal: (requestId: string, nurseId: string, nurseObj?: any) => Promise<boolean>;
  updateReferralStatusLocal: (referralId: string, status: string, responseNotes?: string) => Promise<boolean>;
  updateBillStatusLocal: (billId: string, status: string, paymentData?: any) => Promise<boolean>;
  updateAssignmentStatusLocal: (assignmentId: string, status: string) => Promise<boolean>;
  addUserLocal: (newUser: any) => void;
  updateUserLocal: (userId: string, updates: any) => void;
  invalidateUserCache: (userId: string) => void;
}

const defaultContext: AdminDataContextType = {
  doctors: [],
  nurses: [],
  patients: [],
  pharmacists: [],
  transactions: [],
  billing: { bills: [], metrics: null },
  referrals: [],
  homeCare: [],
  assignments: { nurseAssignments: { count: 0, items: [] }, doctorAssignments: { count: 0, items: [] } },
  affiliations: [],
  stats: null,
  analyticsData: null,
  userDetailsCache: {},
  isPreloaded: false,
  isSyncing: false,
  lastSyncTime: null,
  syncError: null,
  preloadAll: async () => {},
  refreshSection: async () => {},
  getUserDetailsFast: async () => null,
  fetchAnalytics: async () => null,
  toggleUserStatusLocal: async () => false,
  deleteUserLocal: async () => false,
  updateHomeCareStatusLocal: async () => false,
  assignNurseToHomeCareLocal: async () => false,
  updateReferralStatusLocal: async () => false,
  updateBillStatusLocal: async () => false,
  updateAssignmentStatusLocal: async () => false,
  addUserLocal: () => {},
  updateUserLocal: () => {},
  invalidateUserCache: () => {}
};

const AdminDataContext = createContext<AdminDataContextType>(defaultContext);

const CACHE_STORAGE_KEY = 'medizo_admin_portal_cache_v2';

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [nurses, setNurses] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [pharmacists, setPharmacists] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [billing, setBilling] = useState<{ bills: any[]; metrics: any }>({ bills: [], metrics: null });
  const [referrals, setReferrals] = useState<any[]>([]);
  const [homeCare, setHomeCare] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any>({
    nurseAssignments: { count: 0, items: [] },
    doctorAssignments: { count: 0, items: [] }
  });
  const [affiliations, setAffiliations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [userDetailsCache, setUserDetailsCache] = useState<Record<string, any>>({});
  const [isPreloaded, setIsPreloaded] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const isBootstrappingRef = useRef(false);

  // 1. Initial Instant Cache Hydration from sessionStorage (0ms startup)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const cached = sessionStorage.getItem(CACHE_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.doctors) setDoctors(parsed.doctors);
          if (parsed.nurses) setNurses(parsed.nurses);
          if (parsed.patients) setPatients(parsed.patients);
          if (parsed.pharmacists) setPharmacists(parsed.pharmacists);
          if (parsed.transactions) setTransactions(parsed.transactions);
          if (parsed.billing) setBilling(parsed.billing);
          if (parsed.referrals) setReferrals(parsed.referrals);
          if (parsed.homeCare) setHomeCare(parsed.homeCare);
          if (parsed.assignments) setAssignments(parsed.assignments);
          if (parsed.affiliations) setAffiliations(parsed.affiliations);
          if (parsed.stats) setStats(parsed.stats);
          if (parsed.userDetailsCache) setUserDetailsCache(parsed.userDetailsCache);
          setIsPreloaded(true);
          setLastSyncTime(new Date(parsed.savedAt || Date.now()));
        }
      }
    } catch (e) {
      console.warn('[Admin Cache] Failed to load session storage cache:', e);
    }
  }, []);

  // Save to SessionStorage whenever key datasets change
  const persistCache = useCallback(
    (allData: any) => {
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(
            CACHE_STORAGE_KEY,
            JSON.stringify({
              ...allData,
              savedAt: new Date().toISOString()
            })
          );
        }
      } catch (e) {
        console.warn('[Admin Cache] Failed to save session storage cache:', e);
      }
    },
    []
  );

  // 2. Preload ALL 10 Admin Sections via High-Speed /bootstrap Endpoint (or parallel fallback)
  const preloadAll = useCallback(
    async (forceRefresh = false) => {
      if (isBootstrappingRef.current && !forceRefresh) return;
      isBootstrappingRef.current = true;
      setIsSyncing(true);
      setSyncError(null);

      try {
        let res = null;
        try {
          res = await adminApi.getBootstrapData();
        } catch (bootstrapErr) {
          console.warn('[Admin API] /bootstrap endpoint error, falling back to parallel fetch:', bootstrapErr);
        }

        if (res && res.success && res.data) {
          const d = res.data;
          setDoctors(d.doctors || []);
          setNurses(d.nurses || []);
          setPatients(d.patients || []);
          setPharmacists(d.pharmacists || []);
          setTransactions(d.transactions || []);
          setBilling(d.billing || { bills: [], metrics: null });
          setReferrals(d.referrals || []);
          setHomeCare(d.homeCare || []);
          setAssignments(d.assignments || { nurseAssignments: { count: 0, items: [] }, doctorAssignments: { count: 0, items: [] } });
          setAffiliations(d.affiliations || []);
          setStats(d.stats || null);

          persistCache({
            doctors: d.doctors || [],
            nurses: d.nurses || [],
            patients: d.patients || [],
            pharmacists: d.pharmacists || [],
            transactions: d.transactions || [],
            billing: d.billing || { bills: [], metrics: null },
            referrals: d.referrals || [],
            homeCare: d.homeCare || [],
            assignments: d.assignments,
            affiliations: d.affiliations || [],
            stats: d.stats || null
          });
        } else {
          // Fallback Parallel Fetch across endpoints
          const [
            docRes,
            patRes,
            pharmRes,
            nurseRes,
            txRes,
            billRes,
            refRes,
            hcRes,
            assignRes,
            affilRes,
            statsRes
          ] = await Promise.allSettled([
            adminApi.getUsers('doctor'),
            adminApi.getUsers('patient'),
            adminApi.getUsers('pharmacist'),
            adminExtraApi.getNurses(),
            adminApi.getPrescriptionTransactions(),
            adminExtraApi.getBillingOverview(),
            adminExtraApi.getReferralsOverview(),
            adminExtraApi.getHomeCareOverview(),
            adminExtraApi.getAssignmentsOverview(),
            adminExtraApi.getAffiliations(),
            adminApi.getStats()
          ]);

          const loadedDoctors = docRes.status === 'fulfilled' && docRes.value?.success ? docRes.value.users || [] : [];
          const loadedPatients = patRes.status === 'fulfilled' && patRes.value?.success ? patRes.value.users || [] : [];
          const loadedPharmacists = pharmRes.status === 'fulfilled' && pharmRes.value?.success ? pharmRes.value.users || [] : [];
          const loadedNurses = nurseRes.status === 'fulfilled' && nurseRes.value?.success ? nurseRes.value.nurses || [] : [];
          const loadedTransactions = txRes.status === 'fulfilled' && txRes.value?.success ? txRes.value.transactions || [] : [];
          const loadedBilling = billRes.status === 'fulfilled' && billRes.value?.success ? { bills: billRes.value.bills || [], metrics: billRes.value.metrics || null } : { bills: [], metrics: null };
          const loadedReferrals = refRes.status === 'fulfilled' && refRes.value?.success ? refRes.value.referrals || [] : [];
          const loadedHomeCare = hcRes.status === 'fulfilled' && hcRes.value?.success ? hcRes.value.requests || [] : [];
          const loadedAssignments = assignRes.status === 'fulfilled' && assignRes.value?.success ? { nurseAssignments: assignRes.value.nurseAssignments || { count: 0, items: [] }, doctorAssignments: assignRes.value.doctorAssignments || { count: 0, items: [] } } : { nurseAssignments: { count: 0, items: [] }, doctorAssignments: { count: 0, items: [] } };
          const loadedAffiliations = affilRes.status === 'fulfilled' && affilRes.value?.success ? affilRes.value.affiliations || [] : [];
          const loadedStats = statsRes.status === 'fulfilled' && statsRes.value?.success ? statsRes.value.stats : null;

          setDoctors(loadedDoctors);
          setPatients(loadedPatients);
          setPharmacists(loadedPharmacists);
          setNurses(loadedNurses);
          setTransactions(loadedTransactions);
          setBilling(loadedBilling);
          setReferrals(loadedReferrals);
          setHomeCare(loadedHomeCare);
          setAssignments(loadedAssignments);
          setAffiliations(loadedAffiliations);
          setStats(loadedStats);

          persistCache({
            doctors: loadedDoctors,
            patients: loadedPatients,
            pharmacists: loadedPharmacists,
            nurses: loadedNurses,
            transactions: loadedTransactions,
            billing: loadedBilling,
            referrals: loadedReferrals,
            homeCare: loadedHomeCare,
            assignments: loadedAssignments,
            affiliations: loadedAffiliations,
            stats: loadedStats
          });
        }

        setIsPreloaded(true);
        setLastSyncTime(new Date());
      } catch (err: any) {
        console.error('[Admin Cache] Failed to preload portal data:', err);
        setSyncError(err?.message || 'Failed to sync portal data');
      } finally {
        setIsSyncing(false);
        isBootstrappingRef.current = false;
      }
    },
    [persistCache]
  );

  // Run initial preload on mount if user is authenticated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (token) {
        preloadAll();
      }
    }
  }, [preloadAll]);

  // 3. Refresh a Single Section On Demand (e.g. Refresh Roster button)
  const refreshSection = useCallback(async (sectionKey: string) => {
    setIsSyncing(true);
    try {
      if (sectionKey === 'doctors') {
        const res = await adminApi.getUsers('doctor');
        if (res.success) setDoctors(res.users || []);
      } else if (sectionKey === 'patients') {
        const res = await adminApi.getUsers('patient');
        if (res.success) setPatients(res.users || []);
      } else if (sectionKey === 'pharmacists') {
        const res = await adminApi.getUsers('pharmacist');
        if (res.success) setPharmacists(res.users || []);
      } else if (sectionKey === 'nurses') {
        const res = await adminExtraApi.getNurses();
        if (res.success) setNurses(res.nurses || []);
      } else if (sectionKey === 'billing') {
        const res = await adminExtraApi.getBillingOverview();
        if (res.success) setBilling({ bills: res.bills || [], metrics: res.metrics || null });
      } else if (sectionKey === 'homeCare') {
        const res = await adminExtraApi.getHomeCareOverview();
        if (res.success) setHomeCare(res.requests || []);
      } else if (sectionKey === 'referrals') {
        const res = await adminExtraApi.getReferralsOverview();
        if (res.success) setReferrals(res.referrals || []);
      } else if (sectionKey === 'assignments') {
        const res = await adminExtraApi.getAssignmentsOverview();
        if (res.success) setAssignments(res);
      } else if (sectionKey === 'transactions') {
        const res = await adminApi.getPrescriptionTransactions();
        if (res.success) setTransactions(res.transactions || []);
      } else if (sectionKey === 'stats') {
        const res = await adminApi.getStats();
        if (res.success) setStats(res.stats);
      }
      setLastSyncTime(new Date());
    } catch (e) {
      console.error(`[Admin Cache] Error refreshing ${sectionKey}:`, e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // 4. Instant 360-Degree User Details Cache (0ms modal opening)
  const getUserDetailsFast = useCallback(
    async (userId: string, initialUserData?: any) => {
      if (!userId) return null;

      // If already in cache, return immediately
      if (userDetailsCache[userId]) {
        // Silently re-validate in background
        adminApi.getUserDetails(userId).then(freshRes => {
          if (freshRes.success) {
            setUserDetailsCache(prev => ({ ...prev, [userId]: freshRes }));
          }
        }).catch(() => {});
        return userDetailsCache[userId];
      }

      // Fetch from API and cache
      try {
        const res = await adminApi.getUserDetails(userId);
        if (res.success) {
          setUserDetailsCache(prev => ({ ...prev, [userId]: res }));
          return res;
        }
      } catch (err) {
        console.warn(`[Admin Cache] Could not fetch details for ${userId}`);
      }

      return null;
    },
    [userDetailsCache]
  );

  const invalidateUserCache = useCallback((userId: string) => {
    setUserDetailsCache(prev => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  }, []);

  // 5. Cross-Platform Comprehensive Analytics Fetcher
  const fetchAnalytics = useCallback(
    async (range: string = '30d', forceRefresh = false) => {
      if (analyticsData && !forceRefresh && analyticsData.timeRange === range) {
        return analyticsData;
      }
      try {
        const res = await adminApi.getComprehensiveAnalytics(range);
        if (res && res.success) {
          setAnalyticsData(res.data);
          return res.data;
        }
      } catch (err) {
        console.warn('[Admin Cache] Failed to fetch comprehensive analytics:', err);
      }
      return null;
    },
    [analyticsData]
  );

  // 6. Optimistic Local State Mutations (Instant UI response with 0 reload)
  const toggleUserStatusLocal = useCallback(
    async (userId: string, newStatus: 'active' | 'deactivated'): Promise<boolean> => {
      // Optimistically update all rosters
      const updateList = (list: any[]) =>
        list.map(u => (String(u.id || u._id) === String(userId) ? { ...u, status: newStatus } : u));

      setDoctors(updateList);
      setPatients(updateList);
      setPharmacists(updateList);
      setNurses(updateList);

      // Invalidate user details cache
      invalidateUserCache(userId);

      try {
        const res = await adminApi.toggleUserStatus(userId, newStatus);
        return Boolean(res.success);
      } catch (e) {
        console.error('[Admin Cache] Failed to toggle user status on server:', e);
        // Revert on error
        preloadAll(true);
        return false;
      }
    },
    [invalidateUserCache, preloadAll]
  );

  const deleteUserLocal = useCallback(
    async (userId: string): Promise<boolean> => {
      // Optimistically filter out across all lists
      const filterList = (list: any[]) =>
        list.filter(u => String(u.id || u._id || u.email) !== String(userId));

      setDoctors(filterList);
      setPatients(filterList);
      setPharmacists(filterList);
      setNurses(filterList);

      // Remove from cache
      invalidateUserCache(userId);

      try {
        const res = await adminApi.deleteUser(userId);
        return Boolean(res.success);
      } catch (e) {
        console.error('[Admin Cache] Failed to delete user on server:', e);
        preloadAll(true);
        return false;
      }
    },
    [invalidateUserCache, preloadAll]
  );

  const updateHomeCareStatusLocal = useCallback(
    async (requestId: string, status: string): Promise<boolean> => {
      setHomeCare(prev => prev.map(h => (String(h.id) === String(requestId) ? { ...h, status } : h)));
      try {
        const res = await adminApi.updateHomeCareStatus(requestId, status);
        return Boolean(res.success);
      } catch (e) {
        console.error('[Admin Cache] Failed to update home care status:', e);
        refreshSection('homeCare');
        return false;
      }
    },
    [refreshSection]
  );

  const assignNurseToHomeCareLocal = useCallback(
    async (requestId: string, nurseId: string, nurseObj?: any): Promise<boolean> => {
      setHomeCare(prev =>
        prev.map(h =>
          String(h.id) === String(requestId)
            ? {
                ...h,
                assignedNurseId: nurseId,
                status: 'assigned',
                nurseFirstName: nurseObj?.firstName || h.nurseFirstName,
                nurseLastName: nurseObj?.lastName || h.nurseLastName,
                nursePhone: nurseObj?.phone || h.nursePhone
              }
            : h
        )
      );
      try {
        const res = await adminApi.assignNurseToHomeCare(requestId, nurseId);
        return Boolean(res.success);
      } catch (e) {
        console.error('[Admin Cache] Failed to assign nurse on server:', e);
        refreshSection('homeCare');
        return false;
      }
    },
    [refreshSection]
  );

  const updateReferralStatusLocal = useCallback(
    async (referralId: string, status: string, responseNotes?: string): Promise<boolean> => {
      setReferrals(prev =>
        prev.map(r => (String(r.id) === String(referralId) ? { ...r, status, responseNotes: responseNotes || r.responseNotes } : r))
      );
      try {
        const res = await adminApi.updateReferralStatus(referralId, status, responseNotes);
        return Boolean(res.success);
      } catch (e) {
        console.error('[Admin Cache] Failed to update referral status on server:', e);
        refreshSection('referrals');
        return false;
      }
    },
    [refreshSection]
  );

  const updateBillStatusLocal = useCallback(
    async (billId: string, status: string, paymentData?: any): Promise<boolean> => {
      setBilling(prev => ({
        ...prev,
        bills: (prev.bills || []).map(b =>
          String(b.id) === String(billId)
            ? {
                ...b,
                status,
                amountPaid: status === 'paid' ? b.totalAmount : b.amountPaid,
                balanceDue: status === 'paid' ? 0 : b.balanceDue,
                paymentMethod: paymentData?.paymentMethod || b.paymentMethod || 'cash',
                paymentTransactionRef: paymentData?.paymentTransactionRef || b.paymentTransactionRef
              }
            : b
        )
      }));
      try {
        const res = await adminApi.updateBillStatus(billId, status, paymentData);
        return Boolean(res.success);
      } catch (e) {
        console.error('[Admin Cache] Failed to update bill status on server:', e);
        refreshSection('billing');
        return false;
      }
    },
    [refreshSection]
  );

  const updateAssignmentStatusLocal = useCallback(
    async (assignmentId: string, status: string): Promise<boolean> => {
      setAssignments((prev: any) => ({
        ...prev,
        nurseAssignments: {
          ...prev.nurseAssignments,
          items: (prev.nurseAssignments?.items || []).map((a: any) =>
            String(a.id) === String(assignmentId) ? { ...a, status } : a
          )
        }
      }));
      try {
        const res = await adminApi.updateAssignmentStatus(assignmentId, status);
        return Boolean(res.success);
      } catch (e) {
        console.error('[Admin Cache] Failed to update assignment status on server:', e);
        refreshSection('assignments');
        return false;
      }
    },
    [refreshSection]
  );

  const addUserLocal = useCallback((newUser: any) => {
    if (newUser.role === 'doctor') setDoctors(prev => [newUser, ...prev]);
    else if (newUser.role === 'patient') setPatients(prev => [newUser, ...prev]);
    else if (newUser.role === 'pharmacist') setPharmacists(prev => [newUser, ...prev]);
    else if (newUser.role === 'nurse') setNurses(prev => [newUser, ...prev]);
  }, []);

  const updateUserLocal = useCallback((userId: string, updates: any) => {
    const updateList = (list: any[]) =>
      list.map(u => (String(u.id || u._id) === String(userId) ? { ...u, ...updates } : u));

    setDoctors(updateList);
    setPatients(updateList);
    setPharmacists(updateList);
    setNurses(updateList);
    invalidateUserCache(userId);
  }, [invalidateUserCache]);

  return (
    <AdminDataContext.Provider
      value={{
        doctors,
        nurses,
        patients,
        pharmacists,
        transactions,
        billing,
        referrals,
        homeCare,
        assignments,
        affiliations,
        stats,
        analyticsData,
        userDetailsCache,
        isPreloaded,
        isSyncing,
        lastSyncTime,
        syncError,
        preloadAll,
        refreshSection,
        getUserDetailsFast,
        fetchAnalytics,
        toggleUserStatusLocal,
        deleteUserLocal,
        updateHomeCareStatusLocal,
        assignNurseToHomeCareLocal,
        updateReferralStatusLocal,
        updateBillStatusLocal,
        updateAssignmentStatusLocal,
        addUserLocal,
        updateUserLocal,
        invalidateUserCache
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => useContext(AdminDataContext);
