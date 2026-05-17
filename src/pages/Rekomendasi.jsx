import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Save } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../components/ui/Toast';
import EmptyState from '../components/ui/EmptyState';
import { getCropEmoji, formatDateShort } from '../utils/formatters';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const scoreColor = (score) => {
  if (score >= 80) return 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20';
  if (score >= 60) return 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20';
  return 'text-destructive-500 dark:text-destructive-400 bg-destructive-50 dark:bg-destructive-900/20';
};

export default function Rekomendasi() {
  const { recommendations, predictions } = useAppData();
  const { addToast } = useToast();

  // Get latest recommendation or derive from latest prediction
  const latestRec = recommendations[0];
  const latestPrediction = predictions[0];

  const displayRecs = latestRec?.recommendations || latestPrediction?.recommendations;
  const sourceInfo = latestRec || latestPrediction;

  if (!displayRecs || !sourceInfo) {
    return (
      <div className="page-content pb-24 md:pb-8">
        <h1 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-6">Rekomendasi</h1>
        <EmptyState
          icon={BookOpen}
          title="Belum Ada Rekomendasi"
          description="Jalankan prediksi terlebih dahulu untuk mendapatkan rekomendasi perawatan tanaman"
        />
      </div>
    );
  }

  return (
    <div className="page-content pb-24 md:pb-8">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        <motion.div variants={item}>
          <h1 className="font-display font-bold text-xl text-gray-900 dark:text-white">Rekomendasi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Berdasarkan prediksi untuk {getCropEmoji(sourceInfo.cropType)} {sourceInfo.projectName}
          </p>
        </motion.div>

        {/* Summary Card */}
        <motion.div variants={item} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 p-5 text-white">
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
              {getCropEmoji(sourceInfo.cropType)}
            </div>
            <div>
              <h2 className="font-display font-bold">{sourceInfo.projectName}</h2>
              <p className="text-sm text-white/70 font-display">
                {formatDateShort(sourceInfo.createdAt)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Recommendation Cards */}
        {displayRecs.map((rec, index) => (
          <motion.div
            key={rec.type}
            variants={item}
            className="glass-card-solid p-5"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl shrink-0 mt-0.5">{rec.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-bold text-gray-900 dark:text-white text-sm">
                    {rec.title}
                  </h3>
                  {rec.score !== undefined && (
                    <span className={`text-xs font-display font-bold px-2 py-0.5 rounded-full shrink-0 ${scoreColor(rec.score)}`}>
                      {rec.score}%
                    </span>
                  )}
                </div>

                {rec.detail && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {rec.detail.name || rec.detail.dosage}
                    </p>
                    {rec.detail.dosage && (
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-display font-semibold">
                        Dosis: {rec.detail.dosage}
                      </p>
                    )}
                    {rec.detail.note && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        💡 {rec.detail.note}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Score bar */}
            {rec.score !== undefined && (
              <div className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rec.score}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    rec.score >= 80 ? 'bg-primary-500' : rec.score >= 60 ? 'bg-accent-500' : 'bg-destructive-500'
                  }`}
                />
              </div>
            )}
          </motion.div>
        ))}

        {/* Disclaimer */}
        <motion.div variants={item} className="p-4 rounded-2xl bg-cream-50 dark:bg-gray-900 border border-cream-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-display leading-relaxed">
            🌱 <span className="font-semibold">Catatan GreenPlant:</span> Rekomendasi ini berdasarkan analisis data yang Anda input dan model prediksi kami. 
            Selalu konsultasikan dengan penyuluh pertanian lokal untuk hasil terbaik.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
