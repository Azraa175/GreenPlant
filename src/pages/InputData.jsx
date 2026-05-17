import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, CloudRain, Thermometer, Droplets, Wind, Loader2, AlertCircle, Save, CheckCircle } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useWeatherAPI } from '../hooks/useWeatherAPI';
import { useToast } from '../components/ui/Toast';
import EmptyState from '../components/ui/EmptyState';
import { getCropEmoji } from '../utils/formatters';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function InputData() {
  const { projects, inputData, saveInputData } = useAppData();
  const { weather, loading: weatherLoading, error: weatherError, fetchWeather } = useWeatherAPI();
  const { addToast } = useToast();

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [form, setForm] = useState({
    temperature: '',
    humidity: '',
    rainfall: '',
    soilPH: '',
    fertilizerAmount: '',
    waterSupply: '',
  });
  const [saved, setSaved] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Load existing data when project is selected
  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
    setSaved(false);
    const existing = inputData[projectId];
    if (existing) {
      setForm({
        temperature: existing.temperature?.toString() || '',
        humidity: existing.humidity?.toString() || '',
        rainfall: existing.rainfall?.toString() || '',
        soilPH: existing.soilPH?.toString() || '',
        fertilizerAmount: existing.fertilizerAmount?.toString() || '',
        waterSupply: existing.waterSupply?.toString() || '',
      });
    } else {
      setForm({ temperature: '', humidity: '', rainfall: '', soilPH: '', fertilizerAmount: '', waterSupply: '' });
    }
  };

  const handleFetchWeather = async () => {
    if (!selectedProject) return;
    const data = await fetchWeather(selectedProject.location);
    if (data) {
      setForm(prev => ({
        ...prev,
        temperature: data.temperature.toString(),
        humidity: data.humidity.toString(),
        rainfall: data.rainfall.toString(),
      }));
      addToast('Data cuaca berhasil dimuat ☀️', 'success');
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    if (!selectedProjectId) {
      addToast('Pilih proyek terlebih dahulu', 'warning');
      return;
    }

    const numericForm = {};
    for (const [key, val] of Object.entries(form)) {
      if (val === '') {
        addToast(`Semua field harus diisi`, 'warning');
        return;
      }
      numericForm[key] = Number(val);
    }

    saveInputData(selectedProjectId, {
      ...numericForm,
      projectId: selectedProjectId,
      projectName: selectedProject?.name,
      cropType: selectedProject?.cropType,
      landArea: selectedProject?.landArea,
      location: selectedProject?.location,
    });

    setSaved(true);
    addToast('Data berhasil disimpan ✅', 'success');
  };

  if (projects.length === 0) {
    return (
      <div className="page-content pb-24 md:pb-8">
        <h1 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-6">Input Data</h1>
        <EmptyState
          icon={CloudRain}
          title="Belum Ada Proyek"
          description="Buat proyek tanaman terlebih dahulu sebelum menginput data"
        />
      </div>
    );
  }

  return (
    <div className="page-content pb-24 md:pb-8">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <h1 className="font-display font-bold text-xl text-gray-900 dark:text-white">Input Data</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Masukkan data kondisi lahan & cuaca</p>
        </motion.div>

        {/* Step 1: Select Project */}
        <motion.div variants={item} className="glass-card-solid p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-display font-bold">1</div>
            <h3 className="font-display font-semibold text-gray-900 dark:text-white text-sm">Pilih Proyek</h3>
          </div>
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="input-field appearance-none pr-10"
            >
              <option value="">Pilih proyek tanaman...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{getCropEmoji(p.cropType)} {p.name} — {p.location}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </motion.div>

        {selectedProject && (
          <>
            {/* Step 2: Weather Data */}
            <motion.div variants={item} className="glass-card-solid p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-display font-bold">2</div>
                <h3 className="font-display font-semibold text-gray-900 dark:text-white text-sm">Data Cuaca</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Ambil data cuaca otomatis untuk lokasi <span className="font-semibold">{selectedProject.location}</span>
              </p>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleFetchWeather}
                disabled={weatherLoading}
                className="btn-secondary w-full flex items-center justify-center gap-2 mb-3"
              >
                {weatherLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Mengambil data cuaca...</>
                ) : (
                  <><CloudRain size={16} /> Ambil Data Cuaca</>
                )}
              </motion.button>

              {weatherError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-accent-50 dark:bg-accent-900/20 mb-3">
                  <AlertCircle size={16} className="text-accent-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-accent-700 dark:text-accent-300 font-display font-medium">{weatherError}</p>
                    <p className="text-xs text-accent-600/70 dark:text-accent-400/70 mt-0.5">Anda bisa input data secara manual di bawah</p>
                  </div>
                </div>
              )}

              {weather && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Thermometer, label: 'Suhu', value: `${weather.temperature}°C`, color: 'text-orange-500' },
                    { icon: Droplets, label: 'Kelembaban', value: `${weather.humidity}%`, color: 'text-blue-500' },
                    { icon: CloudRain, label: 'Curah Hujan', value: `${weather.rainfall} mm`, color: 'text-indigo-500' },
                    { icon: Wind, label: 'Angin', value: `${weather.windSpeed} km/h`, color: 'text-teal-500' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <Icon size={16} className={color} />
                      <div>
                        <p className="text-[10px] text-gray-400 font-display">{label}</p>
                        <p className="text-sm font-display font-bold text-gray-900 dark:text-white">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Step 3: Manual Input */}
            <motion.div variants={item} className="glass-card-solid p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-display font-bold">3</div>
                <h3 className="font-display font-semibold text-gray-900 dark:text-white text-sm">Parameter Lengkap</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'temperature', label: 'Suhu (°C)', placeholder: '27', icon: '🌡️' },
                  { key: 'humidity', label: 'Kelembaban (%)', placeholder: '75', icon: '💧' },
                  { key: 'rainfall', label: 'Curah Hujan (mm)', placeholder: '180', icon: '🌧️' },
                  { key: 'soilPH', label: 'pH Tanah', placeholder: '6.5', icon: '🌍' },
                  { key: 'fertilizerAmount', label: 'Pupuk (kg/ha)', placeholder: '250', icon: '💊' },
                  { key: 'waterSupply', label: 'Suplai Air (1-10)', placeholder: '7', icon: '🚰' },
                ].map(({ key, label, placeholder, icon }) => (
                  <div key={key}>
                    <label className="block text-xs font-display font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                      {icon} {label}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={form[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="input-field"
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                className={`mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold transition-all duration-200 ${
                  saved
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800'
                    : 'btn-primary'
                }`}
              >
                {saved ? <><CheckCircle size={18} /> Data Tersimpan</> : <><Save size={18} /> Simpan Data</>}
              </motion.button>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
