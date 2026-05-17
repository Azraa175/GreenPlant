import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Moon, Sun, Monitor, Bell, BellOff, Download, Info, LogOut, ChevronRight, Leaf, Camera, Shield, Lock, Key, Eye, EyeOff, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../components/ui/Toast';
import { ConfirmModal } from '../components/ui/Modal';
import Modal from '../components/ui/Modal';
import { checkPasswordStrength } from '../utils/security';
import { validatePassword, validateConfirmPassword } from '../utils/validation';
import { formatDate } from '../utils/formatters';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

function ChangePasswordModal({ isOpen, onClose }) {
  const { changePassword, user } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.current) newErrors.current = 'Password saat ini wajib diisi';
    const passErr = validatePassword(form.newPass);
    if (passErr) newErrors.newPass = passErr;
    const confirmErr = validateConfirmPassword(form.newPass, form.confirm);
    if (confirmErr) newErrors.confirm = confirmErr;

    if (form.current && form.newPass && form.current === form.newPass) {
      newErrors.newPass = 'Password baru harus berbeda dari yang lama';
    }

    const strength = checkPasswordStrength(form.newPass);
    if (!strength.isValid && !newErrors.newPass) {
      newErrors.newPass = 'Password baru harus memenuhi syarat keamanan';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await changePassword(form.current, form.newPass);
      addToast('Password berhasil diubah 🔒', 'success');
      setForm({ current: '', newPass: '', confirm: '' });
      onClose();
    } catch (err) {
      addToast(err.message, 'error');
      setErrors({ current: err.message });
    } finally {
      setLoading(false);
    }
  };

  const strength = form.newPass ? checkPasswordStrength(form.newPass) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔒 Ubah Password" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-display font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Password Saat Ini</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showCurrent ? 'text' : 'password'}
              value={form.current}
              onChange={(e) => { setForm(p => ({ ...p, current: e.target.value })); setErrors(p => ({ ...p, current: '' })); }}
              className={`input-field pl-10 pr-10 !py-2.5 text-sm ${errors.current ? 'input-error' : ''}`}
              placeholder="Masukkan password saat ini"
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.current && <p className="text-destructive-500 text-xs mt-1 font-display">{errors.current}</p>}
        </div>

        <div>
          <label className="block text-xs font-display font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Password Baru</label>
          <div className="relative">
            <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showNew ? 'text' : 'password'}
              value={form.newPass}
              onChange={(e) => { setForm(p => ({ ...p, newPass: e.target.value })); setErrors(p => ({ ...p, newPass: '' })); }}
              className={`input-field pl-10 pr-10 !py-2.5 text-sm ${errors.newPass ? 'input-error' : ''}`}
              placeholder="Min 8 karakter, huruf besar & angka"
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.newPass && <p className="text-destructive-500 text-xs mt-1 font-display">{errors.newPass}</p>}
          {strength && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="flex-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    {i < strength.passed && <div className="h-full rounded-full" style={{ backgroundColor: strength.color }} />}
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-display font-semibold" style={{ color: strength.color }}>{strength.label}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-display font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Konfirmasi Password Baru</label>
          <div className="relative">
            <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={form.confirm}
              onChange={(e) => { setForm(p => ({ ...p, confirm: e.target.value })); setErrors(p => ({ ...p, confirm: '' })); }}
              className={`input-field pl-10 !py-2.5 text-sm ${errors.confirm ? 'input-error' : ''}`}
              placeholder="Ulangi password baru"
            />
          </div>
          {errors.confirm && <p className="text-destructive-500 text-xs mt-1 font-display">{errors.confirm}</p>}
          {form.confirm && form.newPass === form.confirm && !errors.confirm && (
            <p className="text-primary-500 text-xs mt-1 font-display flex items-center gap-1"><Check size={12} /> Password cocok</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 text-sm">
            Batal
          </button>
          <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }} className="btn-primary flex-1 text-sm !py-2.5">
            {loading ? 'Menyimpan...' : 'Ubah Password'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
}

export default function Profil() {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { settings, updateSettings, exportData } = useAppData();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [showLogout, setShowLogout] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  const [theme, setTheme] = useState(settings.theme || 'system');

  const isGoogleUser = user?.provider === 'google';
  const isCloud = !!useAppData().isCloud;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    updateSettings({ theme });
  }, [theme]);

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      addToast('Nama tidak boleh kosong', 'warning');
      return;
    }
    updateProfile({ name: editName, email: editEmail });
    setEditMode(false);
    addToast('Profil berhasil diperbarui ✅', 'success');
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
    addToast('Berhasil keluar. Sampai jumpa! 👋', 'info');
  };

  const handleExport = () => {
    exportData();
    addToast('Data berhasil diekspor 📁', 'success');
  };

  const themeOptions = [
    { value: 'light', icon: Sun, label: 'Terang' },
    { value: 'dark', icon: Moon, label: 'Gelap' },
    { value: 'system', icon: Monitor, label: 'Sistem' },
  ];

  return (
    <div className="page-content pb-24 md:pb-8">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        <motion.div variants={item}>
          <h1 className="font-display font-bold text-xl text-gray-900 dark:text-white">Profil & Pengaturan</h1>
        </motion.div>

        {/* Profile Card */}
        <motion.div variants={item} className="glass-card-solid p-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-display font-bold shadow-md">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-full flex items-center justify-center shadow-sm">
                <Camera size={12} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1">
              {editMode ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-field !py-2 text-sm"
                    placeholder="Nama"
                  />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="input-field !py-2 text-sm"
                    placeholder="Email"
                    disabled={isGoogleUser}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setEditMode(false)} className="btn-ghost text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
                      Batal
                    </button>
                    <button onClick={handleSaveProfile} className="btn-primary !py-1.5 !px-3 text-xs">
                      Simpan
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                    {isGoogleUser && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-display font-semibold">
                        <svg width="12" height="12" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        Google
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Mail size={13} /> {user?.email}
                  </p>
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-xs text-primary-600 dark:text-primary-400 font-display font-semibold mt-1"
                  >
                    Edit Profil
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Account Security */}
        <motion.div variants={item} className="glass-card-solid p-5">
          <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Shield size={16} className="text-primary-600" /> Keamanan Akun
          </h3>
          
          <div className="space-y-3">
            {/* Provider Info */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div>
                <p className="text-xs text-gray-400 font-display">Metode Login</p>
                <p className="text-sm font-display font-semibold text-gray-900 dark:text-white mt-0.5">
                  {isGoogleUser ? '🔗 Google Account' : '📧 Email & Password'}
                </p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                <Check size={12} className="text-primary-600" />
                <span className="text-[10px] font-display font-semibold text-primary-600 dark:text-primary-400">Terverifikasi</span>
              </div>
            </div>

            {/* Last Login */}
            {user?.lastLoginAt && (
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-400 font-display">Login Terakhir</p>
                <p className="text-sm font-display font-semibold text-gray-900 dark:text-white mt-0.5">
                  {formatDate(user.lastLoginAt)}
                </p>
              </div>
            )}

            {/* Password Section */}
            {!isGoogleUser && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div>
                  <p className="text-xs text-gray-400 font-display">Password</p>
                  <p className="text-sm font-display text-gray-600 dark:text-gray-300 mt-0.5">••••••••</p>
                </div>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="text-xs text-primary-600 dark:text-primary-400 font-display font-semibold px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                >
                  Ubah
                </button>
              </div>
            )}

            {isGoogleUser && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700 dark:text-blue-300 font-display leading-relaxed">
                  Akun ini terhubung dengan Google. Keamanan password dikelola oleh Google Account Anda.
                </p>
              </div>
            )}

            {/* Security Tip */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20">
              <Shield size={14} className="text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-primary-700 dark:text-primary-300 font-display leading-relaxed">
                Password dienkripsi dengan SHA-256 dan tidak pernah disimpan dalam bentuk teks biasa.
                {!isGoogleUser && ' Akun akan terkunci selama 5 menit setelah 5x percobaan login gagal.'}
              </p>
            </div>

            {/* Cloud Storage Status */}
            <div className={`flex items-center justify-between p-3 rounded-xl ${isCloud ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isCloud ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                <div>
                  <p className="text-xs text-gray-400 font-display">Penyimpanan Data</p>
                  <p className="text-sm font-display font-semibold text-gray-900 dark:text-white mt-0.5">
                    {isCloud ? '☁️ Cloud (Supabase)' : '💾 Lokal (Browser)'}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-display font-semibold px-2 py-1 rounded-lg ${
                isCloud ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
              }`}>
                {isCloud ? 'Tersinkron' : 'Hanya Lokal'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Theme */}
        <motion.div variants={item} className="glass-card-solid p-5">
          <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white mb-3">🎨 Tema Tampilan</h3>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {themeOptions.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-display font-semibold transition-all duration-200 ${
                  theme === value
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div variants={item} className="glass-card-solid divide-y divide-gray-100 dark:divide-gray-800">
          {/* Notifications */}
          <button
            onClick={() => {
              updateSettings({ notifications: !settings.notifications });
              addToast(settings.notifications ? 'Notifikasi dimatikan' : 'Notifikasi diaktifkan 🔔', 'info');
            }}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              {settings.notifications ? <Bell size={18} className="text-primary-600" /> : <BellOff size={18} className="text-gray-400" />}
              <span className="font-display font-medium text-sm text-gray-900 dark:text-white">Notifikasi</span>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 ${
              settings.notifications ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}>
              <motion.div
                animate={{ x: settings.notifications ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-5 h-5 bg-white rounded-full shadow-sm"
              />
            </div>
          </button>

          {/* Export */}
          <button onClick={handleExport} className="w-full flex items-center justify-between p-4 group">
            <div className="flex items-center gap-3">
              <Download size={18} className="text-data-500" />
              <div className="text-left">
                <span className="font-display font-medium text-sm text-gray-900 dark:text-white block">Backup Data</span>
                <span className="text-xs text-gray-400">Ekspor semua data sebagai JSON</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
          </button>

          {/* About */}
          <button onClick={() => setShowAbout(true)} className="w-full flex items-center justify-between p-4 group">
            <div className="flex items-center gap-3">
              <Info size={18} className="text-blue-500" />
              <span className="font-display font-medium text-sm text-gray-900 dark:text-white">Tentang GreenPlant</span>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
          </button>
        </motion.div>

        {/* Logout */}
        <motion.div variants={item}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowLogout(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-destructive-200 dark:border-destructive-800 text-destructive-500 font-display font-semibold hover:bg-destructive-50 dark:hover:bg-destructive-900/20 transition-all"
          >
            <LogOut size={18} />
            Keluar
          </motion.button>
        </motion.div>

        {/* Version */}
        <motion.div variants={item} className="text-center py-4">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Leaf size={14} className="text-primary-500" />
            <span className="font-display font-bold text-sm text-primary-600 dark:text-primary-400">GreenPlant</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Versi 1.0.0 · © 2026</p>
        </motion.div>
      </motion.div>

      {/* Logout Confirmation */}
      <ConfirmModal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogout}
        title="Keluar dari GreenPlant"
        message="Apakah Anda yakin ingin keluar? Sesi Anda akan diakhiri."
        confirmText="Ya, Keluar"
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      {/* About Modal */}
      <Modal isOpen={showAbout} onClose={() => setShowAbout(false)} title="Tentang GreenPlant" size="sm">
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Leaf size={32} className="text-white" />
          </div>
          <h3 className="font-display font-extrabold text-xl text-primary-600 dark:text-primary-400">GreenPlant</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-display mt-1">Prediksi Panen, Raih Hasil Terbaik</p>
          <div className="mt-4 space-y-2 text-xs text-gray-500 dark:text-gray-400">
            <p>Versi 1.0.0</p>
            <p>Sistem Prediksi & Rekomendasi Panen</p>
            <p>untuk Petani Indonesia 🇮🇩</p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20">
              <p className="text-xs text-primary-700 dark:text-primary-300 font-display">
                <Shield size={12} className="inline mr-1" />
                Password dienkripsi SHA-256 · Data lokal · Sesi aman
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
