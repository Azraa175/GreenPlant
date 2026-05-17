import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, Share2, MapPin, TrendingUp, Calendar, ChevronLeft, ArrowRight } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../components/ui/Toast';
import { ConfirmModal } from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { getCropEmoji, formatDateShort, formatTime, formatNumber, getCropLabel } from '../utils/formatters';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

function DetailView({ record, onBack, onDelete, onShare }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-display font-semibold mb-2">
        <ChevronLeft size={18} /> Kembali
      </button>

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-700 p-6 text-white">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{getCropEmoji(record.cropType)}</span>
          <div>
            <h2 className="font-display font-bold text-lg">{record.projectName}</h2>
            <div className="flex items-center gap-1 text-sm text-white/70">
              <MapPin size={12} /> {record.location || 'Indonesia'}
            </div>
          </div>
        </div>
        <div className="flex items-end gap-2 mt-4">
          <span className="text-4xl font-display font-extrabold">{formatNumber(record.result?.totalYield)}</span>
          <span className="text-lg text-white/80 mb-0.5">ton</span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-sm text-white/70">
          <span>{formatNumber(record.result?.yieldPerHectare)} ton/ha</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-xs font-semibold">
            <TrendingUp size={12} /> {record.result?.accuracy}%
          </span>
        </div>
      </div>

      {/* Input Data */}
      {record.inputData && (
        <div className="glass-card-solid p-5">
          <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white mb-3">📋 Data Input</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Suhu', value: `${record.inputData.temperature}°C` },
              { label: 'Kelembaban', value: `${record.inputData.humidity}%` },
              { label: 'Curah Hujan', value: `${record.inputData.rainfall} mm` },
              { label: 'pH Tanah', value: record.inputData.soilPH },
              { label: 'Pupuk', value: `${record.inputData.fertilizerAmount} kg/ha` },
              { label: 'Suplai Air', value: `${record.inputData.waterSupply}/10` },
            ].map(({ label, value }) => (
              <div key={label} className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                <p className="text-[10px] text-gray-400 font-display">{label}</p>
                <p className="text-sm font-display font-bold text-gray-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Factors */}
      {record.result?.factors && (
        <div className="glass-card-solid p-5">
          <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white mb-3">🔬 Faktor Pengaruh</h3>
          <div className="space-y-2">
            {Object.entries(record.result.factors).map(([key, value]) => {
              const labels = { temperature: 'Suhu', humidity: 'Kelembaban', rainfall: 'Curah Hujan', soil: 'Tanah', fertilizer: 'Pupuk', water: 'Air' };
              const colors = { temperature: 'bg-orange-500', humidity: 'bg-blue-500', rainfall: 'bg-indigo-500', soil: 'bg-purple-500', fertilizer: 'bg-amber-500', water: 'bg-cyan-500' };
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-display w-20">{labels[key]}</span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${colors[key]}`}
                    />
                  </div>
                  <span className="text-xs font-display font-bold text-gray-700 dark:text-gray-300 w-10 text-right">{value}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Date & Meta */}
      <div className="glass-card-solid p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar size={14} />
          <span className="font-display">{formatDateShort(record.createdAt)} · {formatTime(record.createdAt)}</span>
        </div>
        <span className="badge-purple">{getCropLabel(record.cropType)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <motion.button whileTap={{ scale: 0.97 }} onClick={onShare} className="btn-secondary flex-1 flex items-center justify-center gap-2">
          <Share2 size={16} /> Bagikan
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onDelete} className="btn-destructive flex-1 flex items-center justify-center gap-2">
          <Trash2 size={16} /> Hapus
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function Riwayat() {
  const { predictions, deletePrediction } = useAppData();
  const { addToast } = useToast();
  const [selectedId, setSelectedId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const selectedRecord = predictions.find(p => p.id === selectedId);

  const handleShare = async (record) => {
    const text = `🌱 GreenPlant - Hasil Prediksi Panen\n\n📊 ${record.projectName}\n🌾 ${getCropLabel(record.cropType)}\n📍 ${record.location || 'Indonesia'}\n📈 Estimasi: ${formatNumber(record.result?.totalYield)} ton\n🎯 Akurasi: ${record.result?.accuracy}%\n\n#GreenPlant #PrediksiPanen`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'GreenPlant - Prediksi Panen', text });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      addToast('Hasil disalin ke clipboard 📋', 'success');
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deletePrediction(deleteId);
      if (selectedId === deleteId) setSelectedId(null);
      addToast('Riwayat berhasil dihapus', 'info');
      setDeleteId(null);
    }
  };

  return (
    <div className="page-content pb-24 md:pb-8">
      <AnimatePresence mode="wait">
        {selectedRecord ? (
          <DetailView
            key="detail"
            record={selectedRecord}
            onBack={() => setSelectedId(null)}
            onDelete={() => setDeleteId(selectedRecord.id)}
            onShare={() => handleShare(selectedRecord)}
          />
        ) : (
          <motion.div key="list" variants={container} initial="hidden" animate="show" className="space-y-4">
            <motion.div variants={item}>
              <h1 className="font-display font-bold text-xl text-gray-900 dark:text-white">Riwayat Prediksi</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{predictions.length} catatan tersimpan</p>
            </motion.div>

            {predictions.length > 0 ? (
              predictions.map((record) => (
                <motion.div
                  key={record.id}
                  variants={item}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedId(record.id)}
                  className="card-interactive p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-xl shrink-0">
                      {getCropEmoji(record.cropType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white truncate">
                        {record.projectName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin size={11} />
                        <span>{record.location || 'Indonesia'}</span>
                        <span>·</span>
                        <span>{formatDateShort(record.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-lg font-display font-extrabold text-primary-600 dark:text-primary-400">
                          {formatNumber(record.result?.totalYield)} <span className="text-xs font-semibold text-gray-400">ton</span>
                        </span>
                        <span className="badge-green text-[10px]">
                          <TrendingUp size={10} className="mr-0.5" /> {record.result?.accuracy}%
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-300 dark:text-gray-600 shrink-0 mt-3" />
                  </div>
                </motion.div>
              ))
            ) : (
              <EmptyState
                icon={History}
                title="Belum Ada Riwayat"
                description="Jalankan prediksi pertama Anda dan simpan hasilnya di sini"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Riwayat"
        message="Apakah Anda yakin ingin menghapus catatan prediksi ini?"
        confirmText="Ya, Hapus"
      />
    </div>
  );
}
