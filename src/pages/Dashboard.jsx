import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, FileInput, LineChart, History, BookOpen, TrendingUp, Sprout, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { getGreeting, formatDateShort, getCropEmoji, formatNumber } from '../utils/formatters';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { projects, predictions } = useAppData();
  const navigate = useNavigate();

  const lastPrediction = predictions[0];
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const quickActions = [
    { icon: FolderOpen, label: 'Proyek', desc: 'Kelola tanaman', to: '/proyek', color: 'from-primary-500 to-primary-600' },
    { icon: FileInput, label: 'Input Data', desc: 'Catat kondisi', to: '/input-data', color: 'from-blue-500 to-blue-600' },
    { icon: LineChart, label: 'Prediksi', desc: 'Analisis panen', to: '/prediksi', color: 'from-data-500 to-data-600' },
    { icon: BookOpen, label: 'Rekomendasi', desc: 'Tips terbaik', to: '/rekomendasi', color: 'from-accent-500 to-accent-600' },
  ];

  return (
    <div className="page-content pb-24 md:pb-8">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Welcome Section */}
        <motion.div variants={item} className="md:hidden">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-display">{today}</p>
          <h1 className="font-display font-bold text-xl text-gray-900 dark:text-white mt-1">
            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
        </motion.div>

        {/* Hero Card */}
        <motion.div
          variants={item}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 p-6 text-white shadow-lg"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sprout size={20} />
              <span className="text-sm font-display font-medium text-white/80">Ringkasan GreenPlant</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-2xl font-display font-extrabold">{projects.length}</p>
                <p className="text-xs text-white/70 mt-0.5">Proyek Aktif</p>
              </div>
              <div>
                <p className="text-2xl font-display font-extrabold">{predictions.length}</p>
                <p className="text-xs text-white/70 mt-0.5">Total Prediksi</p>
              </div>
              <div>
                <p className="text-2xl font-display font-extrabold">
                  {lastPrediction ? `${lastPrediction.result?.accuracy || 0}%` : '-'}
                </p>
                <p className="text-xs text-white/70 mt-0.5">Akurasi Terakhir</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <h2 className="section-title mb-3">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ icon: Icon, label, desc, to, color }) => (
              <motion.button
                key={to}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(to)}
                className="glass-card-solid p-4 text-left group hover:shadow-card-hover transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-shadow`}>
                  <Icon size={20} className="text-white" />
                </div>
                <p className="font-display font-bold text-sm text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Last Prediction */}
        {lastPrediction && (
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title">Prediksi Terakhir</h2>
              <button
                onClick={() => navigate('/riwayat')}
                className="text-sm text-primary-600 dark:text-primary-400 font-display font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                Semua <ArrowRight size={14} />
              </button>
            </div>
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/riwayat')}
              className="card-interactive p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getCropEmoji(lastPrediction.cropType)}</span>
                    <h3 className="font-display font-bold text-gray-900 dark:text-white">
                      {lastPrediction.projectName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin size={12} />
                    {lastPrediction.location || 'Indonesia'}
                  </div>
                </div>
                <span className="badge-green">
                  <TrendingUp size={12} className="mr-1" />
                  {lastPrediction.result?.accuracy}%
                </span>
              </div>
              <div className="mt-4 flex items-end gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-display">Estimasi Panen</p>
                  <p className="text-2xl font-display font-extrabold text-primary-600 dark:text-primary-400">
                    {formatNumber(lastPrediction.result?.totalYield)} <span className="text-sm font-semibold text-gray-500">ton</span>
                  </p>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                  {formatDateShort(lastPrediction.createdAt)}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Recent Projects */}
        {projects.length > 0 && (
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title">Proyek Terbaru</h2>
              <button
                onClick={() => navigate('/proyek')}
                className="text-sm text-primary-600 dark:text-primary-400 font-display font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                Semua <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {projects.slice(0, 3).map((project) => (
                <motion.div
                  key={project.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/proyek')}
                  className="card-interactive p-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-lg">
                    {getCropEmoji(project.cropType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {project.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {project.landArea} ha · {project.location}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 shrink-0" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state if no projects */}
        {projects.length === 0 && !lastPrediction && (
          <motion.div variants={item} className="text-center py-8">
            <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sprout size={36} className="text-primary-400" />
            </div>
            <h3 className="font-display font-bold text-gray-900 dark:text-white mb-2">
              Mulai Perjalanan Anda
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-xs mx-auto">
              Buat proyek tanaman pertama Anda dan mulai prediksi panen cerdas
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/proyek')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Sprout size={18} />
              Buat Proyek Pertama
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
