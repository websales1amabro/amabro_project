import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile, UserRole } from '../types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: UserRole;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  // For easy preview/testing of the 5 roles in dev mode
  setSimulatedRole: (role: UserRole) => void;
  canViewCommercialAnalysis: boolean;
  canApproveQuotation: boolean;
  canEditTechnicalAnalysis: boolean;
  canManageVendors: boolean;
  canManageInvoices: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default mock profile for development / demo preview when offline
const defaultDevProfiles: Record<UserRole, Profile> = {
  owner: {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'owner@automation.co.id',
    full_name: 'Budi Santoso (Owner)',
    role: 'owner',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  sales: {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'sales@automation.co.id',
    full_name: 'Rian Pratama (Sales)',
    role: 'sales',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  engineer: {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'engineer@automation.co.id',
    full_name: 'Dewi Lestari (Lead Engineer)',
    role: 'engineer',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  purchasing: {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'purchasing@automation.co.id',
    full_name: 'Hendra Wijaya (Purchasing)',
    role: 'purchasing',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  finance: {
    id: '55555555-5555-5555-5555-555555555555',
    email: 'finance@automation.co.id',
    full_name: 'Siti Rahma (Finance)',
    role: 'finance',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(defaultDevProfiles.owner);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Supabase user & profile if configured
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Use dev default mock
      const savedRole = (localStorage.getItem('app_dev_role') as UserRole) || 'owner';
      setProfile(defaultDevProfiles[savedRole] || defaultDevProfiles.owner);
      setIsLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!error && data) {
            setProfile(data as Profile);
          } else {
            // fallback
            setProfile({
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Pengguna',
              role: (session.user.user_metadata?.role as UserRole) || 'sales',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Error fetching auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (data) setProfile(data as Profile);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  const setSimulatedRole = (role: UserRole) => {
    localStorage.setItem('app_dev_role', role);
    setProfile(defaultDevProfiles[role]);
  };

  const role: UserRole = profile?.role || 'sales';

  // PRD Hard Rules for Permissions:
  // - Sales & Engineer CANNOT view cost & margin (commercial_analysis / internal_quotations)
  // - Owner and limited Finance can view cost/margin
  // - Only Owner can approve/reject quotations
  const canViewCommercialAnalysis = role === 'owner' || role === 'finance';
  const canApproveQuotation = role === 'owner';
  const canEditTechnicalAnalysis = role === 'owner' || role === 'engineer' || role === 'sales';
  const canManageVendors = role === 'owner' || role === 'purchasing';
  const canManageInvoices = role === 'owner' || role === 'finance';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signOut,
        setSimulatedRole,
        canViewCommercialAnalysis,
        canApproveQuotation,
        canEditTechnicalAnalysis,
        canManageVendors,
        canManageInvoices,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
