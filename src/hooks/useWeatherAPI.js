import { useState, useCallback } from 'react';

// Simulated weather data for Indonesian regions
const WEATHER_DATA = {
  default: { temperature: 28, humidity: 75, rainfall: 180, windSpeed: 12, condition: 'Cerah Berawan' },
  'jawa barat': { temperature: 27, humidity: 78, rainfall: 200, windSpeed: 10, condition: 'Hujan Ringan' },
  'jawa tengah': { temperature: 29, humidity: 72, rainfall: 160, windSpeed: 14, condition: 'Cerah' },
  'jawa timur': { temperature: 30, humidity: 68, rainfall: 140, windSpeed: 15, condition: 'Cerah' },
  'sumatera utara': { temperature: 26, humidity: 82, rainfall: 220, windSpeed: 8, condition: 'Hujan Sedang' },
  'sumatera barat': { temperature: 25, humidity: 85, rainfall: 250, windSpeed: 7, condition: 'Hujan Lebat' },
  'kalimantan': { temperature: 28, humidity: 80, rainfall: 210, windSpeed: 9, condition: 'Berawan' },
  'sulawesi': { temperature: 29, humidity: 74, rainfall: 170, windSpeed: 11, condition: 'Cerah Berawan' },
  'bali': { temperature: 30, humidity: 70, rainfall: 130, windSpeed: 16, condition: 'Cerah' },
  'ntt': { temperature: 31, humidity: 60, rainfall: 90, windSpeed: 18, condition: 'Cerah' },
  'papua': { temperature: 27, humidity: 88, rainfall: 280, windSpeed: 6, condition: 'Hujan Lebat' },
};

const getWeatherForLocation = (location) => {
  const loc = location.toLowerCase();
  for (const [key, data] of Object.entries(WEATHER_DATA)) {
    if (loc.includes(key)) return data;
  }
  // Add slight randomness to default
  const base = WEATHER_DATA.default;
  return {
    ...base,
    temperature: base.temperature + (Math.random() * 4 - 2),
    humidity: Math.round(base.humidity + (Math.random() * 10 - 5)),
    rainfall: Math.round(base.rainfall + (Math.random() * 40 - 20)),
  };
};

export function useWeatherAPI() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = useCallback(async (location) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

      // 10% chance of simulated failure
      if (Math.random() < 0.1) {
        throw new Error('Gagal mengambil data cuaca. Silakan coba lagi atau input manual.');
      }

      const data = getWeatherForLocation(location);
      const result = {
        ...data,
        temperature: Math.round(data.temperature * 10) / 10,
        location,
        fetchedAt: new Date().toISOString(),
      };

      setWeather(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearWeather = useCallback(() => {
    setWeather(null);
    setError(null);
  }, []);

  return { weather, loading, error, fetchWeather, clearWeather };
}

export default useWeatherAPI;
