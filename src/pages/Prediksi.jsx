import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Loader2, TrendingUp, Save, BookOpen, Leaf, BarChart3 } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { usePredictionModel } from '../hooks/usePredictionModel';
import { useToast } from '../components/ui/Toast';
import EmptyState from '../components/ui/EmptyState';
import { PredictionChart, FactorsChart } from '../components/charts/PredictionChart';
import { getCropEmoji, getCropLabel, formatNumber } from '../utils/formatters';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

function ProcessingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl flex flex-col items-center justify-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 rounded-full border-4 border-primary-100 dark:border-primary-900 border-t-primary-600 mb-6"
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 mb-2"
      >
        <Leaf size={20} className="text-primary-600" />
        <span className="font-display font-bold text-lg text-primary-600 dark:text-primary-400">GreenPlant</span>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-sm text-gray-500 dark:text-gray-400 font-display"
      >
        Menganalisis data & membuat prediksi...
      </motion.p>
    </motion.div>
  );
}

export default function Prediksi() {
  const { projects, inputData, savePrediction, saveRecommendation } = useAppData();
  const { prediction, recommendations, loading, runPrediction } = usePredictionModel();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectInput = inputData[selectedProjectId];

  const handlePredict = async () => {
    if (!selectedProjectId || !projectInput) {
      addToast('Pastikan Anda telah menginput data untuk proyek ini', 'warning');
      return;
    }

    await runPrediction({
      ...projectInput,
      cropType: selectedProject.cropType,
      landArea: selectedProject.landArea,
    });
    setIsSaved(false);
  };

  const handleSave = () => {
    if (!prediction) return;
    const saved = savePrediction({
      projectId: selectedProjectId,
      projectName: selectedProject.name,
      cropType: selectedProject.cropType,
      landArea: selectedProject.landArea,
      location: selectedProject.location,
      inputData: projectInput,
      result: prediction,
      recommendations,
    });

    if (recommendations) {
      saveRecommendation({
        predictionId: saved.id,
        projectId: selectedProjectId,
        projectName: selectedProject.name,
        cropType: selectedProject.cropType,
        recommendations,
        createdAt: new Date().toISOString(),
      });
    }

    setIsSaved(true);
    addToast('Prediksi berhasil disimpan! 📊', 'success');
  };

  // Chart data for visualization
  const chartData = prediction ? [
    { name: 'Prediksi', prediksi: prediction.totalYield, aktual: Math.round(prediction.totalYield * (0.85 + Math.random() * 0.3) * 100) / 100 },
    { name: 'Per Hektar', prediksi: prediction.yieldPerHectare, aktual: Math.round(prediction.yieldPerHectare * (0.85 + Math.random() * 0.3) * 100) / 100 },
  ] : [];

  const projectsWithData = projects.filter(p => inputData[p.id]);

  if (projects.length === 0) {
    return (
      <div className="page-content pb-24 md:pb-8">
        <h1 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-6">Prediksi Panen</h1>
        <EmptyState icon={BarChart3} title="Belum Ada Proyek" description="Buat proyek & input data terlebih dahulu" />
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>{loading && <ProcessingScreen />}</AnimatePresence>

      <div className="page-content pb-24 md:pb-8">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          <motion.div variants={item}>
            <h1 className="font-display font-bold text-xl text-gray-900 dark:text-white">Prediksi Panen</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Analisis data & dapatkan estimasi panen</p>
          </motion.div>

          {/* Project Selection */}
          <motion.div variants={item} className="glass-card-solid p-5">
            <label className="block text-xs font-display font-semibold text-gray-600 dark:text-gray-400 mb-2">Pilih Proyek</label>
            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={(e) => { setSelectedProjectId(e.target.value); setIsSaved(false); }}
                className="input-field appearance-none pr-10"
              >
                <option value="">Pilih proyek...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {getCropEmoji(p.cropType)} {p.name}
                    {inputData[p.id] ? ' ✅' : ' (belum ada data)'}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {selectedProject && !projectInput && (
              <div className="mt-3 p-3 rounded-xl bg-accent-50 dark:bg-accent-900/20">
                <p className="text-xs text-accent-700 dark:text-accent-300 font-display">
                  ⚠️ Belum ada data input untuk proyek ini. <button onClick={() => navigate('/input-data')} className="underline font-semibold">Input data sekarang</button>
                </p>
              </div>
            )}

            {selectedProject && projectInput && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handlePredict}
                disabled={loading}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <TrendingUp size={18} />}
                Jalankan Prediksi
              </motion.button>
            )}
          </motion.div>

          {/* Results */}
          <AnimatePresence>
            {prediction && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Main Result */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 p-6 text-white shadow-lg">
                  <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
                  <p className="text-sm text-white/70 font-display mb-1">Estimasi Hasil Panen</p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-display font-extrabold">{formatNumber(prediction.totalYield)}</span>
                    <span className="text-xl text-white/80 font-display mb-1">ton</span>
                  </div>
                  <p className="text-sm text-white/70 mt-1 font-display">
                    {formatNumber(prediction.yieldPerHectare)} ton/ha · {getCropLabel(selectedProject?.cropType)}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-sm font-display font-semibold">
                    <TrendingUp size={14} />
                    Akurasi Model: {prediction.accuracy}%
                  </div>
                </div>

                {/* Chart */}
                <div className="glass-card-solid p-5">
                  <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white mb-4">📊 Grafik Prediksi</h3>
                  <PredictionChart data={chartData} />
                </div>

                {/* Factors */}
                <div className="glass-card-solid p-5">
                  <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white mb-4">🔬 Faktor Pengaruh</h3>
                  <FactorsChart factors={prediction.factors} />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    disabled={isSaved}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold transition-all ${
                      isSaved
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800'
                        : 'btn-primary'
                    }`}
                  >
                    <Save size={18} />
                    {isSaved ? 'Tersimpan ✅' : 'Simpan ke Riwayat'}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/rekomendasi')}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <BookOpen size={18} />
                    Rekomendasi
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
