// Validation utilities for GreenPlant forms

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email wajib diisi';
  if (!re.test(email)) return 'Format email tidak valid';
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password wajib diisi';
  if (password.length < 8) return 'Password minimal 8 karakter';
  if (!/[A-Z]/.test(password)) return 'Password harus mengandung huruf besar';
  if (!/[0-9]/.test(password)) return 'Password harus mengandung angka';
  return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Konfirmasi password wajib diisi';
  if (password !== confirmPassword) return 'Password tidak cocok';
  return '';
};

export const validateName = (name) => {
  if (!name || !name.trim()) return 'Nama wajib diisi';
  if (name.trim().length < 2) return 'Nama minimal 2 karakter';
  return '';
};

export const validateProjectName = (name) => {
  if (!name || !name.trim()) return 'Nama proyek wajib diisi';
  return '';
};

export const validateCropType = (type) => {
  if (!type) return 'Jenis tanaman wajib dipilih';
  return '';
};

export const validateLandArea = (area) => {
  if (!area && area !== 0) return 'Luas lahan wajib diisi';
  if (isNaN(area) || Number(area) <= 0) return 'Luas lahan harus lebih dari 0';
  return '';
};

export const validateLocation = (location) => {
  if (!location || !location.trim()) return 'Lokasi wajib diisi';
  return '';
};

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) return 'Nomor HP wajib diisi';
  // Remove spaces, dashes
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Accept Indonesian formats: 08xx, +628xx, 628xx
  const re = /^(\+?62|0)8[1-9][0-9]{7,11}$/;
  if (!re.test(cleaned)) return 'Format nomor HP tidak valid (contoh: 081234567890)';
  return '';
};

export const normalizePhone = (phone) => {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+62')) return cleaned;
  if (cleaned.startsWith('62')) return '+' + cleaned;
  if (cleaned.startsWith('0')) return '+62' + cleaned.slice(1);
  return cleaned;
};

export const validateNumber = (value, fieldName) => {
  if (value === '' || value === undefined || value === null) return `${fieldName} wajib diisi`;
  if (isNaN(value) || Number(value) < 0) return `${fieldName} harus berupa angka positif`;
  return '';
};
