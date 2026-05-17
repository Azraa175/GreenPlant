// Formatter utilities for GreenPlant

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateShort = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined) return '-';
  return Number(num).toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

export const formatTons = (num) => `${formatNumber(num)} ton`;
export const formatHectare = (num) => `${formatNumber(num)} ha`;
export const formatTemp = (num) => `${formatNumber(num, 1)}°C`;
export const formatPercent = (num) => `${formatNumber(num, 0)}%`;

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
};

export const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

export const CROP_TYPES = [
  { value: 'padi', label: 'Padi', emoji: '🌾' },
  { value: 'jagung', label: 'Jagung', emoji: '🌽' },
  { value: 'cabai', label: 'Cabai', emoji: '🌶️' },
  { value: 'kedelai', label: 'Kedelai', emoji: '🫘' },
  { value: 'singkong', label: 'Singkong', emoji: '🥔' },
];

export const getCropLabel = (value) => {
  const crop = CROP_TYPES.find(c => c.value === value);
  return crop ? `${crop.emoji} ${crop.label}` : value;
};

export const getCropEmoji = (value) => {
  const crop = CROP_TYPES.find(c => c.value === value);
  return crop ? crop.emoji : '🌱';
};
