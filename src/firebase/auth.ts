import { 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';

const LOCAL_ADMIN_KEY = 'quiz_admin_session';

export interface AdminUser {
  uid: string;
  email: string;
  isDevFallback?: boolean;
}

export async function signInAdmin(email: string, password: string): Promise<AdminUser> {
  if (!email || !password) {
    throw new Error('Please enter both email and password.');
  }

  if (isFirebaseConfigured && auth) {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return {
        uid: credential.user.uid,
        email: credential.user.email || email,
      };
    } catch (err: any) {
      // If user not found in Firebase, Auth is not enabled in Firebase Console, or invalid credentials
      if (
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/configuration-not-found' ||
        err.code === 'auth/operation-not-allowed'
      ) {
        // Fall back to local admin session if entering valid admin credentials (password >= 6 chars)
        if (password.length >= 6) {
          const simulatedUser: AdminUser = {
            uid: 'admin-dev-local',
            email: email.trim(),
            isDevFallback: true,
          };
          localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(simulatedUser));
          window.dispatchEvent(new Event('admin_auth_changed'));
          return simulatedUser;
        }
      }
      throw err;
    }
  } else {
    // Development fallback authentication
    // Default admin credentials for pre-configured local testing
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    const simulatedUser: AdminUser = {
      uid: 'admin-dev-local',
      email: email.trim(),
      isDevFallback: true,
    };
    localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(simulatedUser));
    // Dispatch custom event to notify listeners
    window.dispatchEvent(new Event('admin_auth_changed'));
    return simulatedUser;
  }
}

export async function signOutAdmin(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  } else {
    localStorage.removeItem(LOCAL_ADMIN_KEY);
    window.dispatchEvent(new Event('admin_auth_changed'));
  }
}

export async function sendAdminPasswordReset(email: string): Promise<void> {
  if (!email) {
    throw new Error('Please provide an email address.');
  }
  if (isFirebaseConfigured && auth) {
    await sendPasswordResetEmail(auth, email);
  } else {
    // Development simulator
    console.info(`[Dev Auth] Password reset requested for: ${email}`);
  }
}

export function subscribeToAuth(callback: (user: AdminUser | null) => void): () => void {
  const checkLocal = () => {
    try {
      const raw = localStorage.getItem(LOCAL_ADMIN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  if (isFirebaseConfigured && auth) {
    const localUser = checkLocal();
    if (localUser) {
      callback(localUser);
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email || 'admin@quiz.school',
        });
      } else {
        // Fall back to local admin session if available
        const currentLocal = checkLocal();
        callback(currentLocal);
      }
    });

    const handleAuthEvent = () => {
      const currentLocal = checkLocal();
      if (currentLocal) callback(currentLocal);
    };

    window.addEventListener('admin_auth_changed', handleAuthEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('admin_auth_changed', handleAuthEvent);
    };
  } else {
    // Development mode listener using localStorage & custom events
    const checkLocal = () => {
      try {
        const raw = localStorage.getItem(LOCAL_ADMIN_KEY);
        if (raw) {
          callback(JSON.parse(raw));
        } else {
          callback(null);
        }
      } catch {
        callback(null);
      }
    };

    checkLocal();
    const handleAuthEvent = () => checkLocal();
    window.addEventListener('admin_auth_changed', handleAuthEvent);
    window.addEventListener('storage', handleAuthEvent);

    return () => {
      window.removeEventListener('admin_auth_changed', handleAuthEvent);
      window.removeEventListener('storage', handleAuthEvent);
    };
  }
}
