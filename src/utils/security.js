// Security utilities for GreenPlant

/**
 * Hash a password using SHA-256 via Web Crypto API
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'greenplant_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate password strength
 * Returns { score: 0-4, label, color, checks }
 */
export function checkPasswordStrength(password) {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const passed = Object.values(checks).filter(Boolean).length;

  const levels = [
    { score: 0, label: 'Sangat Lemah', color: '#ef4444' },
    { score: 1, label: 'Lemah', color: '#f97316' },
    { score: 2, label: 'Cukup', color: '#f59e0b' },
    { score: 3, label: 'Kuat', color: '#22c55e' },
    { score: 4, label: 'Sangat Kuat', color: '#16a34a' },
  ];

  const level = levels[Math.min(passed, 4)];

  return {
    ...level,
    passed,
    total: 5,
    checks,
    isValid: checks.minLength && checks.hasUppercase && checks.hasNumber,
  };
}

/**
 * Check login attempts and lockout
 */
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

export function checkLoginLockout(email) {
  try {
    const lockouts = JSON.parse(localStorage.getItem('greenplant_lockouts') || '{}');
    const record = lockouts[email];
    
    if (!record) return { locked: false, attempts: 0 };

    const elapsed = Date.now() - record.lastAttempt;
    
    if (record.attempts >= MAX_ATTEMPTS && elapsed < LOCKOUT_DURATION) {
      const remainingMs = LOCKOUT_DURATION - elapsed;
      const remainingMin = Math.ceil(remainingMs / 60000);
      const remainingSec = Math.ceil(remainingMs / 1000);
      return { 
        locked: true, 
        attempts: record.attempts,
        remainingMin,
        remainingSec,
        remainingMs,
        message: `Akun terkunci. Coba lagi dalam ${remainingMin} menit.`
      };
    }

    // Reset if lockout period has passed
    if (elapsed >= LOCKOUT_DURATION) {
      delete lockouts[email];
      localStorage.setItem('greenplant_lockouts', JSON.stringify(lockouts));
      return { locked: false, attempts: 0 };
    }

    return { locked: false, attempts: record.attempts };
  } catch {
    return { locked: false, attempts: 0 };
  }
}

export function recordFailedLogin(email) {
  try {
    const lockouts = JSON.parse(localStorage.getItem('greenplant_lockouts') || '{}');
    const record = lockouts[email] || { attempts: 0 };
    
    record.attempts += 1;
    record.lastAttempt = Date.now();
    lockouts[email] = record;
    
    localStorage.setItem('greenplant_lockouts', JSON.stringify(lockouts));
    
    const remaining = MAX_ATTEMPTS - record.attempts;
    return { 
      attempts: record.attempts, 
      remaining,
      locked: record.attempts >= MAX_ATTEMPTS 
    };
  } catch {
    return { attempts: 0, remaining: MAX_ATTEMPTS, locked: false };
  }
}

export function clearLoginAttempts(email) {
  try {
    const lockouts = JSON.parse(localStorage.getItem('greenplant_lockouts') || '{}');
    delete lockouts[email];
    localStorage.setItem('greenplant_lockouts', JSON.stringify(lockouts));
  } catch {
    // ignore
  }
}

/**
 * Session management
 */
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days default
const SESSION_SHORT = 2 * 60 * 60 * 1000; // 2 hours if not "remember me"

export function createSession(user, rememberMe = false) {
  const session = {
    user,
    createdAt: Date.now(),
    expiresAt: Date.now() + (rememberMe ? SESSION_DURATION : SESSION_SHORT),
    rememberMe,
  };
  localStorage.setItem('greenplant_session', JSON.stringify(session));
  return session;
}

export function getSession() {
  try {
    const session = JSON.parse(localStorage.getItem('greenplant_session'));
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      localStorage.removeItem('greenplant_session');
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem('greenplant_session');
}

export function extendSession() {
  try {
    const session = JSON.parse(localStorage.getItem('greenplant_session'));
    if (!session) return;
    
    const duration = session.rememberMe ? SESSION_DURATION : SESSION_SHORT;
    session.expiresAt = Date.now() + duration;
    localStorage.setItem('greenplant_session', JSON.stringify(session));
  } catch {
    // ignore
  }
}
