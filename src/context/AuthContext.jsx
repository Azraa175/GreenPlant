import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { migrateLocalToCloud } from '../utils/migration';
import {
  hashPassword,
  checkLoginLockout,
  recordFailedLogin,
  clearLoginAttempts,
  createSession,
  getSession,
  clearSession,
  extendSession
} from '../utils/security';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isCloud: false, // whether using Supabase
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, isLoading: false };
    case 'UPDATE_PROFILE':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CLOUD':
      return { ...state, isCloud: action.payload };
    default:
      return state;
  }
}

// ─── Helper: format Supabase user → app user ───
function formatSupabaseUser(supaUser) {
  return {
    id: supaUser.id,
    name: supaUser.user_metadata?.name || supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'User',
    email: supaUser.email,
    phone: supaUser.phone || supaUser.user_metadata?.phone || null,
    phoneVerified: !!supaUser.phone,
    avatar: supaUser.user_metadata?.avatar_url || null,
    provider: supaUser.app_metadata?.provider || 'email',
    createdAt: supaUser.created_at,
    lastLoginAt: supaUser.last_sign_in_at || new Date().toISOString(),
  };
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const cloudEnabled = isSupabaseConfigured();

  // ─── Check session on mount ───
  useEffect(() => {
    if (cloudEnabled) {
      // Supabase auth listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const userData = formatSupabaseUser(session.user);
          dispatch({ type: 'LOGIN', payload: userData });
          dispatch({ type: 'SET_CLOUD', payload: true });

          // Run one-time migration
          if (event === 'SIGNED_IN') {
            migrateLocalToCloud(session.user.id).catch(console.warn);
          }
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      });

      // Initial session check
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          dispatch({ type: 'LOGIN', payload: formatSupabaseUser(session.user) });
          dispatch({ type: 'SET_CLOUD', payload: true });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Fallback: localStorage session
      try {
        const session = getSession();
        if (session?.user) {
          extendSession();
          dispatch({ type: 'LOGIN', payload: session.user });
        } else {
          clearSession();
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch {
        clearSession();
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  }, [cloudEnabled]);

  // ─── Extend local session on activity ───
  useEffect(() => {
    if (!state.isAuthenticated || cloudEnabled) return;

    const handleActivity = () => extendSession();
    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);

    const interval = setInterval(() => {
      const session = getSession();
      if (!session) dispatch({ type: 'LOGOUT' });
    }, 60000);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      clearInterval(interval);
    };
  }, [state.isAuthenticated, cloudEnabled]);

  // ═══ LOGIN ═══
  const login = useCallback(async (email, password, rememberMe = false) => {
    if (cloudEnabled) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message === 'Invalid login credentials'
        ? 'Email atau password salah.' : error.message);
      return formatSupabaseUser(data.user);
    }

    // Fallback: localStorage
    const lockout = checkLoginLockout(email);
    if (lockout.locked) throw new Error(lockout.message);

    await new Promise(r => setTimeout(r, 800));
    const users = JSON.parse(localStorage.getItem('greenplant_users') || '[]');
    const found = users.find(u => u.email === email.toLowerCase().trim());

    if (!found) {
      const result = recordFailedLogin(email);
      throw new Error(result.remaining > 0
        ? `Email tidak ditemukan. ${result.remaining} percobaan tersisa.`
        : 'Akun terkunci selama 5 menit.');
    }

    const hashedInput = await hashPassword(password);
    if (found.password !== hashedInput) {
      const result = recordFailedLogin(email);
      throw new Error(result.remaining > 0
        ? `Password salah. ${result.remaining} percobaan tersisa.`
        : 'Akun terkunci selama 5 menit.');
    }

    clearLoginAttempts(email);
    found.lastLoginAt = new Date().toISOString();
    found.loginCount = (found.loginCount || 0) + 1;
    localStorage.setItem('greenplant_users', JSON.stringify(users));

    const userData = {
      id: found.id, name: found.name, email: found.email,
      phone: found.phone || null, phoneVerified: found.phoneVerified || false,
      avatar: found.avatar || null, provider: found.provider || 'email',
      createdAt: found.createdAt, lastLoginAt: new Date().toISOString(),
    };

    createSession(userData, rememberMe);
    dispatch({ type: 'LOGIN', payload: userData });
    return userData;
  }, [cloudEnabled]);

  // ═══ REGISTER ═══
  const register = useCallback(async (name, email, password, phone) => {
    if (cloudEnabled) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone, full_name: name },
        },
      });
      if (error) throw new Error(error.message);
      
      // If user is created but session is null, it means email confirmation is required (OTP)
      if (data.user && !data.session) {
        return { requiresOtp: true, email: data.user.email };
      }
      
      if (data.user) {
        const user = formatSupabaseUser(data.user);
        createSession(user, false);
        dispatch({ type: 'LOGIN', payload: user });
        return user;
      }
      throw new Error('Registrasi berhasil. Cek email untuk verifikasi.');
    }

    // Fallback: localStorage
    await new Promise(r => setTimeout(r, 800));
    const normalizedEmail = email.toLowerCase().trim();
    const users = JSON.parse(localStorage.getItem('greenplant_users') || '[]');

    if (users.find(u => u.email === normalizedEmail)) {
      throw new Error('Email sudah terdaftar.');
    }
    if (phone && users.find(u => u.phone === phone)) {
      throw new Error('Nomor HP sudah terdaftar.');
    }

    const hashedPassword = await hashPassword(password);
    const newUser = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      name: name.trim(), email: normalizedEmail, phone: phone || null,
      phoneVerified: !!phone, password: hashedPassword, avatar: null,
      provider: 'email', createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(), loginCount: 1,
    };

    users.push(newUser);
    localStorage.setItem('greenplant_users', JSON.stringify(users));

    const userData = {
      id: newUser.id, name: newUser.name, email: newUser.email,
      phone: newUser.phone, phoneVerified: newUser.phoneVerified,
      avatar: null, provider: 'email',
      createdAt: newUser.createdAt, lastLoginAt: newUser.lastLoginAt,
    };

    createSession(userData, false);
    dispatch({ type: 'LOGIN', payload: userData });
    
    // Fallback: return requiresOtp: true so we can simulate OTP screen
    return { requiresOtp: true, email: userData.email, simulatedUser: userData };
  }, [cloudEnabled]);

  // ═══ VERIFY EMAIL OTP ═══
  const verifyEmailOtp = useCallback(async (email, token, simulatedUser = null) => {
    if (cloudEnabled) {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });
      if (error) throw new Error(error.message);
      if (data.user && data.session) {
        const user = formatSupabaseUser(data.user);
        createSession(user, false);
        dispatch({ type: 'LOGIN', payload: user });
        return user;
      }
      throw new Error('Verifikasi gagal atau sesi tidak valid.');
    }

    // Fallback: localStorage (Simulate OTP verification)
    await new Promise(r => setTimeout(r, 800));
    // In simulated mode, we just accept any 6 digits for demo purposes
    if (token.length === 6 && simulatedUser) {
      createSession(simulatedUser, false);
      dispatch({ type: 'LOGIN', payload: simulatedUser });
      return simulatedUser;
    }
    throw new Error('Kode OTP tidak valid.');
  }, [cloudEnabled]);

  // ═══ RESEND EMAIL OTP ═══
  const resendEmailOtp = useCallback(async (email) => {
    if (cloudEnabled) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw new Error(error.message);
      return true;
    }

    // Fallback: simulated
    await new Promise(r => setTimeout(r, 800));
    return true;
  }, [cloudEnabled]);

  // ═══ GOOGLE LOGIN ═══
  const loginWithGoogle = useCallback(async () => {
    if (cloudEnabled) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/dashboard' },
      });
      if (error) throw new Error(error.message);
      return; // redirect happens automatically
    }

    // Fallback: simulated
    await new Promise(r => setTimeout(r, 1500));
    const googleProfiles = [
      { name: 'Petani Cerdas', email: 'petani.cerdas@gmail.com' },
      { name: 'Agri Expert', email: 'agri.expert@gmail.com' },
    ];

    const profile = googleProfiles[Math.floor(Math.random() * googleProfiles.length)];
    const users = JSON.parse(localStorage.getItem('greenplant_users') || '[]');
    let existingUser = users.find(u => u.email === profile.email);

    if (!existingUser) {
      existingUser = {
        id: 'g_' + Date.now().toString(36), name: profile.name,
        email: profile.email, password: null, avatar: null,
        phone: null, phoneVerified: false, provider: 'google',
        createdAt: new Date().toISOString(), lastLoginAt: new Date().toISOString(), loginCount: 1,
      };
      users.push(existingUser);
    } else {
      existingUser.lastLoginAt = new Date().toISOString();
      existingUser.loginCount = (existingUser.loginCount || 0) + 1;
      const idx = users.findIndex(u => u.email === profile.email);
      users[idx] = existingUser;
    }

    localStorage.setItem('greenplant_users', JSON.stringify(users));

    const userData = {
      id: existingUser.id, name: existingUser.name, email: existingUser.email,
      phone: existingUser.phone || null, phoneVerified: existingUser.phoneVerified || false,
      avatar: existingUser.avatar, provider: 'google',
      createdAt: existingUser.createdAt, lastLoginAt: new Date().toISOString(),
    };

    createSession(userData, true);
    dispatch({ type: 'LOGIN', payload: userData });
    return userData;
  }, [cloudEnabled]);

  // ═══ LOGOUT ═══
  const logout = useCallback(async () => {
    if (cloudEnabled) {
      await supabase.auth.signOut();
    }
    clearSession();
    dispatch({ type: 'LOGOUT' });
  }, [cloudEnabled]);

  // ═══ UPDATE PROFILE ═══
  const updateProfile = useCallback(async (updates) => {
    if (cloudEnabled) {
      const { error } = await supabase.auth.updateUser({
        data: { name: updates.name, full_name: updates.name },
      });
      if (error) console.error('updateProfile error:', error);
    } else {
      const updatedUser = { ...state.user, ...updates };
      const session = getSession();
      if (session) createSession(updatedUser, session.rememberMe);
      const users = JSON.parse(localStorage.getItem('greenplant_users') || '[]');
      const idx = users.findIndex(u => u.id === updatedUser.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], name: updatedUser.name, email: updatedUser.email, avatar: updatedUser.avatar };
        localStorage.setItem('greenplant_users', JSON.stringify(users));
      }
    }
    dispatch({ type: 'UPDATE_PROFILE', payload: updates });
  }, [state.user, cloudEnabled]);

  // ═══ CHANGE PASSWORD ═══
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!state.user) throw new Error('Tidak ada user aktif');

    if (cloudEnabled) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
      return;
    }

    // Fallback
    if (state.user.provider === 'google') throw new Error('Akun Google tidak bisa mengubah password');
    const users = JSON.parse(localStorage.getItem('greenplant_users') || '[]');
    const user = users.find(u => u.id === state.user.id);
    if (!user) throw new Error('User tidak ditemukan');

    const hashedCurrent = await hashPassword(currentPassword);
    if (user.password !== hashedCurrent) throw new Error('Password saat ini salah');

    user.password = await hashPassword(newPassword);
    user.passwordChangedAt = new Date().toISOString();
    const idx = users.findIndex(u => u.id === state.user.id);
    users[idx] = user;
    localStorage.setItem('greenplant_users', JSON.stringify(users));
  }, [state.user, cloudEnabled]);

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      verifyEmailOtp,
      resendEmailOtp,
      loginWithGoogle,
      logout,
      updateProfile,
      changePassword,
      isCloud: state.isCloud || cloudEnabled,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
