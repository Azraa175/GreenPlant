import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, Shield, Check, X, AlertTriangle, Phone, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword, validateName, validateConfirmPassword, validatePhone, normalizePhone } from '../utils/validation';
import { checkPasswordStrength, checkLoginLockout } from '../utils/security';
import { useToast } from '../components/ui/Toast';

function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function PasswordStrengthBar({ password }) {
  if (!password) return null;
  const s = checkPasswordStrength(password);
  const checks = [
    { key: 'minLength', label: 'Min 8 karakter' },
    { key: 'hasUppercase', label: 'Huruf besar' },
    { key: 'hasLowercase', label: 'Huruf kecil' },
    { key: 'hasNumber', label: 'Angka' },
    { key: 'hasSpecial', label: 'Simbol' },
  ];
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            {i < s.passed && <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full rounded-full" style={{ backgroundColor: s.color }} />}
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <span className="text-[11px] font-display font-semibold" style={{ color: s.color }}>{s.label}</span>
        <span className="text-[10px] text-gray-400">{s.passed}/5</span>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
        {checks.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1">
            {s.checks[key] ? <Check size={10} className="text-primary-500" /> : <X size={10} className="text-gray-300" />}
            <span className={`text-[10px] ${s.checks[key] ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400'}`}>{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function OTPVerification({ phone, onVerified, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [sent, setSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const refs = useRef([]);
  const { addToast } = useToast();

  const sendOTP = () => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOTP(code);
    setSent(true);
    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
    addToast(`Kode OTP dikirim ke ${phone}: ${code}`, 'success');
    setTimeout(() => refs.current[0]?.focus(), 100);
  };

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { setError('Masukkan 6 digit kode OTP'); return; }
    setVerifying(true);
    await new Promise(r => setTimeout(r, 1000));
    if (code === generatedOTP) {
      addToast('Nomor HP berhasil diverifikasi ✅', 'success');
      onVerified();
    } else {
      setError('Kode OTP salah. Coba lagi.');
      setOtp(['', '', '', '', '', '']);
      refs.current[0]?.focus();
    }
    setVerifying(false);
  };

  useEffect(() => { sendOTP(); }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-display font-semibold">
        <ChevronLeft size={18} /> Kembali
      </button>
      <div className="text-center">
        <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Phone size={28} className="text-primary-600" />
        </div>
        <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">Verifikasi Nomor HP</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kode OTP dikirim ke <span className="font-semibold text-gray-700 dark:text-gray-300">{phone}</span></p>
      </div>

      <div className="flex justify-center gap-2">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => refs.current[i] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className={`w-11 h-13 text-center text-xl font-display font-bold rounded-xl border-2 transition-all duration-200 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              error ? 'border-destructive-400' : digit ? 'border-primary-400' : 'border-gray-200 dark:border-gray-700'
            }`}
          />
        ))}
      </div>

      {error && <p className="text-center text-destructive-500 text-xs font-display">{error}</p>}

      <motion.button whileTap={{ scale: 0.97 }} onClick={handleVerify} disabled={verifying || otp.join('').length !== 6}
        className="btn-primary w-full flex items-center justify-center gap-2">
        {verifying ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
        {verifying ? 'Memverifikasi...' : 'Verifikasi'}
      </motion.button>

      <div className="text-center">
        {timer > 0 ? (
          <p className="text-xs text-gray-400 font-display">Kirim ulang dalam <span className="font-semibold text-primary-600">{timer}s</span></p>
        ) : (
          <button onClick={sendOTP} className="text-xs text-primary-600 dark:text-primary-400 font-display font-semibold">Kirim Ulang OTP</button>
        )}
      </div>

      <div className="p-3 rounded-xl bg-accent-50 dark:bg-accent-900/20">
        <p className="text-[11px] text-accent-700 dark:text-accent-300 font-display text-center">
          💡 <span className="font-semibold">Demo:</span> Kode OTP ditampilkan di notifikasi toast
        </p>
      </div>
    </motion.div>
  );
}

function SplashScreen({ onComplete }) {
  useEffect(() => { const t = setTimeout(onComplete, 2800); return () => clearTimeout(t); }, [onComplete]);
  return (
    <motion.div className="fixed inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 flex flex-col items-center justify-center z-50"
      exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.5 }}>
      <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl border border-white/30 mb-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
          <Leaf size={48} className="text-white" />
        </motion.div>
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
        className="font-display font-extrabold text-4xl text-white mb-2">GreenPlant</motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
        className="font-display text-white/70 text-sm">Prediksi Panen, Raih Hasil Terbaik</motion.p>
    </motion.div>
  );
}

export default function Auth() {
  const [showSplash, setShowSplash] = useState(true);
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [lockoutSec, setLockoutSec] = useState(0);

  const { login, register, loginWithGoogle, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => { if (isAuthenticated) navigate('/dashboard', { replace: true }); }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (mode === 'login' && form.email) {
      const checkLock = () => {
        const { locked, remainingSec } = checkLoginLockout(form.email);
        if (locked && remainingSec > 0) {
          setLockoutSec(remainingSec);
        } else {
          setLockoutSec(0);
        }
      };
      checkLock();
      const interval = setInterval(checkLock, 1000);
      return () => clearInterval(interval);
    } else {
      setLockoutSec(0);
    }
  }, [mode, form.email]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const validateForm = () => {
    const e = {};
    if (mode === 'register') {
      const nameErr = validateName(form.name); if (nameErr) e.name = nameErr;
      const phoneErr = validatePhone(form.phone); if (phoneErr) e.phone = phoneErr;
      const strength = checkPasswordStrength(form.password);
      const confirmErr = validateConfirmPassword(form.password, form.confirmPassword); if (confirmErr) e.confirmPassword = confirmErr;
      if (!strength.isValid) e.password = e.password || 'Password harus memenuhi syarat keamanan';
    }
    const emailErr = validateEmail(form.email); if (emailErr) e.email = emailErr;
    const passErr = validatePassword(form.password); if (passErr) e.password = passErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;
    if (mode === 'register') { setStep('otp'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password, rememberMe);
      addToast('Selamat datang kembali! 🌱', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      addToast(err.message, 'error');
      if (err.message.includes('terkunci')) {
        setErrors(p => ({ ...p, email: 'Akun terkunci karena terlalu banyak percobaan.' }));
        // Trigger manual check lock to update state immediately
        const { locked, remainingSec } = checkLoginLockout(form.email);
        if (locked) setLockoutSec(remainingSec);
      }
    } finally { setLoading(false); }
  };

  const handleOTPVerified = async () => {
    setLoading(true);
    try {
      const phone = normalizePhone(form.phone);
      await register(form.name, form.email, form.password, phone);
      addToast('Akun berhasil dibuat! 🎉', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) { addToast(err.message, 'error'); setStep('form'); }
    finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      addToast('Login dengan Google berhasil! 🎉', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) { addToast(err.message || 'Gagal login dengan Google', 'error'); }
    finally { setGoogleLoading(false); }
  };

  const handleChange = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const switchMode = (m) => {
    setMode(m); setErrors({}); setStep('form');
    setForm({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  };

  return (
    <>
      <AnimatePresence>{showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}</AnimatePresence>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-cream-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/40 dark:bg-primary-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: showSplash ? 2.8 : 0 }} className="relative w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Leaf size={28} className="text-white" />
            </div>
            <h1 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white">GreenPlant</h1>
            <p className="font-display text-gray-500 dark:text-gray-400 text-sm mt-1">
              {step === 'otp' ? 'Verifikasi nomor HP Anda' : mode === 'login' ? 'Masuk ke akun Anda' : 'Buat akun baru'}
            </p>
          </div>

          <div className="glass-card p-6 space-y-4">
            <AnimatePresence mode="wait">
              {step === 'otp' ? (
                <OTPVerification key="otp" phone={form.phone} onVerified={handleOTPVerified} onBack={() => setStep('form')} />
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Mode Toggle */}
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-4">
                    {['login', 'register'].map(m => (
                      <button key={m} onClick={() => switchMode(m)}
                        className={`flex-1 py-2 rounded-lg text-sm font-display font-semibold transition-all ${mode === m ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500'}`}>
                        {m === 'login' ? 'Masuk' : 'Daftar'}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Name (register) */}
                    {mode === 'register' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <label className="block text-xs font-display font-semibold text-gray-600 dark:text-gray-400 mb-1">Nama Lengkap</label>
                        <div className="relative">
                          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)}
                            className={`input-field pl-10 !py-2.5 text-sm ${errors.name ? 'input-error' : ''}`} placeholder="Masukkan nama lengkap" />
                        </div>
                        {errors.name && <p className="text-destructive-500 text-xs mt-1 font-display">{errors.name}</p>}
                      </motion.div>
                    )}

                    {/* Phone (register) */}
                    {mode === 'register' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <label className="block text-xs font-display font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Nomor HP <span className="text-destructive-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)}
                            className={`input-field pl-10 !py-2.5 text-sm ${errors.phone ? 'input-error' : ''}`} placeholder="081234567890" />
                        </div>
                        {errors.phone && <p className="text-destructive-500 text-xs mt-1 font-display">{errors.phone}</p>}
                        <p className="text-[10px] text-gray-400 mt-0.5 font-display">Akan diverifikasi melalui kode OTP</p>
                      </motion.div>
                    )}

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-display font-semibold text-gray-600 dark:text-gray-400 mb-1">Email</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)}
                          className={`input-field pl-10 !py-2.5 text-sm ${errors.email ? 'input-error' : ''}`} placeholder="email@contoh.com" />
                      </div>
                      {errors.email && <p className="text-destructive-500 text-xs mt-1 font-display">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-display font-semibold text-gray-600 dark:text-gray-400 mb-1">Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => handleChange('password', e.target.value)}
                          className={`input-field pl-10 pr-10 !py-2.5 text-sm ${errors.password ? 'input-error' : ''}`}
                          placeholder={mode === 'register' ? 'Min 8 karakter, huruf besar & angka' : 'Masukkan password'} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.password && <p className="text-destructive-500 text-xs mt-1 font-display">{errors.password}</p>}
                      {mode === 'register' && <PasswordStrengthBar password={form.password} />}
                    </div>

                    {/* Confirm Password (register) */}
                    {mode === 'register' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <label className="block text-xs font-display font-semibold text-gray-600 dark:text-gray-400 mb-1">Konfirmasi Password</label>
                        <div className="relative">
                          <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)}
                            className={`input-field pl-10 pr-10 !py-2.5 text-sm ${errors.confirmPassword ? 'input-error' : ''}`} placeholder="Ulangi password" />
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="text-destructive-500 text-xs mt-1 font-display">{errors.confirmPassword}</p>}
                        {form.confirmPassword && form.password === form.confirmPassword && !errors.confirmPassword && (
                          <p className="text-primary-500 text-xs mt-1 font-display flex items-center gap-1"><Check size={12} /> Password cocok</p>
                        )}
                      </motion.div>
                    )}

                    {/* Remember me (login) */}
                    {mode === 'login' && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div onClick={() => setRememberMe(!rememberMe)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-primary-600 border-primary-600' : 'border-gray-300 dark:border-gray-600'}`}>
                          {rememberMe && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-display">Ingat saya</span>
                      </label>
                    )}

                    {/* Submit */}
                    <motion.button type="submit" disabled={loading || googleLoading || lockoutSec > 0} whileTap={{ scale: 0.97 }} className="btn-primary w-full flex items-center justify-center gap-2 !mt-4 disabled:opacity-50">
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <>{mode === 'login' ? 'Masuk' : 'Lanjutkan Verifikasi'} <ArrowRight size={16} /></>}
                    </motion.button>
                  </form>

                  {/* Lockout Notice */}
                  {mode === 'login' && lockoutSec > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 overflow-hidden">
                      <div className="p-3 rounded-xl bg-destructive-50 dark:bg-destructive-900/20 border border-destructive-100 dark:border-destructive-800">
                        <div className="flex items-center gap-2 text-destructive-600 dark:text-destructive-400">
                          <AlertTriangle size={16} />
                          <span className="text-sm font-display font-semibold">Akun Terkunci</span>
                        </div>
                        <p className="text-xs text-destructive-600/80 dark:text-destructive-400/80 mt-1 font-display">
                          Terlalu banyak percobaan gagal. Silakan coba lagi dalam 
                          <span className="font-bold ml-1 text-destructive-600 dark:text-destructive-400">{formatTime(lockoutSec)}</span>
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    <span className="text-xs text-gray-400 font-display">atau</span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  </div>

                  {/* Google Login - AT BOTTOM */}
                  <motion.button type="button" onClick={handleGoogleLogin} disabled={googleLoading || loading} whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all disabled:opacity-50">
                    {googleLoading ? <Loader2 size={18} className="animate-spin text-gray-400" /> : <GoogleIcon size={18} />}
                    <span className="font-display font-semibold text-sm text-gray-700 dark:text-gray-300">
                      {googleLoading ? 'Menghubungkan...' : `${mode === 'login' ? 'Masuk' : 'Daftar'} dengan Google`}
                    </span>
                  </motion.button>

                  {/* Security notices */}
                  {!(mode === 'login' && lockoutSec > 0) && (
                    <div className="mt-3 p-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20">
                      <p className="text-[10px] text-primary-700 dark:text-primary-300 font-display text-center">
                        {mode === 'register' ? '🔒 Password dienkripsi SHA-256 · Nomor HP diverifikasi OTP' : '⚠️ Akun terkunci 5 menit setelah 5x gagal login'}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4 font-display">GreenPlant v1.0 — Prediksi Panen Cerdas 🌱</p>
        </motion.div>
      </div>
    </>
  );
}
