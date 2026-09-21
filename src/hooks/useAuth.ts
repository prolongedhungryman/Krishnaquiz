import { useState, useEffect, useCallback } from 'react';
import { 
  AdminUser, 
  signInAdmin, 
  signOutAdmin, 
  sendAdminPasswordReset, 
  subscribeToAuth 
} from '../firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const loggedInUser = await signInAdmin(email, pass);
      setUser(loggedInUser);
      setIsSubmitting(false);
      return true;
    } catch (err: unknown) {
      setIsSubmitting(false);
      let message = 'Failed to sign in. Please verify your credentials.';
      if (err instanceof Error) {
        if (err.message.includes('user-not-found') || err.message.includes('wrong-password') || err.message.includes('invalid-credential')) {
          message = 'Invalid email or password. Please check your credentials.';
        } else if (err.message.includes('too-many-requests')) {
          message = 'Too many failed login attempts. Please try again later.';
        } else {
          message = err.message;
        }
      }
      setAuthError(message);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOutAdmin();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  const sendReset = useCallback(async (email: string) => {
    setAuthError(null);
    try {
      await sendAdminPasswordReset(email);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAuthError(err.message);
      }
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    loading,
    authError,
    isSubmitting,
    login,
    logout,
    sendReset,
    clearError,
  };
}
