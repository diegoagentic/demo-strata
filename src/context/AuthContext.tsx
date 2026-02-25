import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  isAllowedDomain,
  getDomainError,
  validatePassword,
  getAuthErrorMessage,
  SESSION_WARNING_MINUTES,
  getTimeUntilExpiry,
} from '../lib/auth-utils';

// --- Types ---

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  showSessionWarning: boolean;
  authEvent: AuthChangeEvent | null;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  signInWithMicrosoft: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  dismissSessionWarning: () => void;
  clearError: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

type AuthContextType = AuthState & AuthActions;

// --- Context ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider ---

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [authEvent, setAuthEvent] = useState<AuthChangeEvent | null>(null);
  const sessionCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Session Expiry Check ---
  const startSessionExpiryCheck = useCallback((currentSession: Session | null) => {
    if (sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current);
    }

    if (!currentSession?.expires_at) return;

    sessionCheckIntervalRef.current = setInterval(() => {
      const msRemaining = getTimeUntilExpiry(currentSession);

      if (msRemaining <= 0) {
        setShowSessionWarning(false);
        supabase.auth.signOut();
        return;
      }

      if (msRemaining <= SESSION_WARNING_MINUTES * 60 * 1000) {
        setShowSessionWarning(true);
      }
    }, 30_000); // Check every 30 seconds
  }, []);

  // --- Initialize Auth ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session) startSessionExpiryCheck(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Post-OAuth domain validation safety layer
      if (event === 'SIGNED_IN' && session?.user) {
        const email = session.user.email;
        if (email && !isAllowedDomain(email)) {
          await supabase.auth.signOut();
          setError('Access restricted to authorized organization domains only.');
          setLoading(false);
          return;
        }
      }

      setSession(session);
      setUser(session?.user ?? null);
      setAuthEvent(event);
      setLoading(false);

      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        setShowSessionWarning(false);
        if (session) startSessionExpiryCheck(session);
      }

      if (event === 'SIGNED_OUT') {
        setShowSessionWarning(false);
        if (sessionCheckIntervalRef.current) {
          clearInterval(sessionCheckIntervalRef.current);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, [startSessionExpiryCheck]);

  // --- Auth Actions ---

  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    const domainError = getDomainError(email);
    if (domainError) {
      setError(domainError);
      setLoading(false);
      return { success: false, error: domainError };
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (authError) {
      const msg = getAuthErrorMessage(authError);
      setError(msg);
      return { success: false, error: msg };
    }

    return { success: true };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setError(null);
    setLoading(true);

    const domainError = getDomainError(email);
    if (domainError) {
      setError(domainError);
      setLoading(false);
      return { success: false, error: domainError };
    }

    const pwValidation = validatePassword(password);
    if (!pwValidation.isValid) {
      const msg = 'Password does not meet all requirements.';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}`,
      },
    });
    setLoading(false);

    if (authError) {
      const msg = getAuthErrorMessage(authError);
      setError(msg);
      return { success: false, error: msg };
    }

    return { success: true, needsVerification: true };
  };

  const signInWithMicrosoft = async () => {
    setError(null);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'openid email profile',
        redirectTo: `${window.location.origin}`,
      },
    });

    if (authError) {
      const msg = getAuthErrorMessage(authError);
      setError(msg);
      return { success: false, error: msg };
    }

    return { success: true };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshSession = async () => {
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      setError(getAuthErrorMessage(refreshError));
    } else {
      setShowSessionWarning(false);
    }
  };

  const dismissSessionWarning = () => setShowSessionWarning(false);
  const clearError = () => setError(null);

  const resetPassword = async (email: string) => {
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    });

    if (resetError) {
      const msg = getAuthErrorMessage(resetError);
      setError(msg);
      return { success: false, error: msg };
    }

    return { success: true };
  };

  return (
    <AuthContext.Provider value={{
      session, user, loading, error, showSessionWarning, authEvent,
      signIn, signUp, signInWithMicrosoft, signOut, refreshSession,
      dismissSessionWarning, clearError, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
