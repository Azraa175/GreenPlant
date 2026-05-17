import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, Ruler, Pencil, Trash2, X, ChevronDown, FolderOpen } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../components/ui/Toast';
import { ConfirmModal } from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { CROP_TYPES, getCropEmoji, formatDateShort } from '../utils/formatters';
import { validateProjectName, validateCropType, validateLandArea, validateLocation } from '../utils/validation';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

function ProjectForm({ project, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: project?.name || '',
    cropType: project?.cropType || '',
    landArea: project?.landArea || '',
    location: project?.location || '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    const n = validateProjectName(form.name); if (n) e.name = n;
    const c = validateCropType(form.cropType); if (c) e.cropType = c;
    const l = validateLandArea(form.landArea); if (l) e.landArea = l;
    const loc = validateLocation(form.location); if (loc) e.location = loc;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ ...form, landArea: Number(form.landArea) });
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card-solid p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-gray-900 dark:text-white">
          {project ? 'Edit Proyek' : 'Proyek Baru'}
        </h3>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <X size={18} className="text-gray-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-display font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Nama Proyek</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`input-field ${errors.name ? 'input-error' : ''}`}
            placeholder="cth. Sawah Padi Musim 1"
          />
          {errors.name && <p className="text-destructive-500 text-xs mt-1 font-display">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-display font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Jenis Tanaman</label>
          <div className="relative">
            <select
              value={form.cropType}
              onChange={(e) => handleChange('cropType', e.target.value)}
              className={`input-field appearance-none pr-10 ${errors.cropType ? 'input-error' : ''}`}
            >
              <option value="">Pilih jenis tanaman</option>
              {CROP_TYPES.map(c => (
                <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {errors.cropType && <p className="text-destructive-500 text-xs mt-1 font-display">{errors.cropType}</p>}
        </div>

        <div>
          <label className="block text-xs font-display font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Luas Lahan (ha)</label>
          <input
            type="number"
            step="0.1"
            value={form.landArea}
            onChange={(e) => handleChange('landArea', e.target.value)}
            className={`input-field ${errors.landArea ? 'input-error' : ''}`}
            placeholder="cth. 2.5"
          />
          {errors.landArea && <p className="text-destructive-500 text-xs mt-1 font-display">{errors.landArea}</p>}
        </div>

        <div>
          <label className="block text-xs font-display font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Lokasi</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className={`input-field ${errors.location ? 'input-error' : ''}`}
            placeholder="cth. Subang, Jawa Barat"
          />
          {errors.location && <p className="text-destructive-500 text-xs mt-1 font-display">{errors.location}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="btn-ghost flex-1 border border-gray-200 dark:border-gray-700 rounded-xl py-3">
            Batal
          </button>
          <motion.button type="submit" whileTap={{ scale: 0.97 }} className="btn-primary flex-1">
            {project ? 'Simpan' : 'Buat Proyek'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

export default function Proyek() {
  const { projects, addProject, updateProject, deleteProject } = useAppData();
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleSave = (data) => {
    if (editingProject) {
      updateProject({ ...editingProject, ...data });
      addToast('Proyek berhasil diperbarui ✅', 'success');
    } else {
      addProject(data);
      addToast('Proyek baru berhasil dibuat 🌱', 'success');
    }
    setShowForm(false);
    setEditingProject(null);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteProject(deleteId);
      addToast('Proyek berhasil dihapus', 'info');
      setDeleteId(null);
    }
  };

  return (
    <div className="page-content pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-xl text-gray-900 dark:text-white">Proyek Tanaman</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{projects.length} proyek aktif</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setEditingProject(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-2 !px-4 !py-2.5 text-sm"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Tambah</span>
        </motion.button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <div className="mb-6">
            <ProjectForm
              project={editingProject}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingProject(null); }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Project List */}
      {projects.length > 0 ? (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={item}
              layout
              className="glass-card-solid p-5 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-2xl shrink-0">
                    {getCropEmoji(project.cropType)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-gray-900 dark:text-white truncate">
                      {project.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Ruler size={12} />
                        {project.landArea} ha
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin size={12} />
                        {project.location}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
                      Dibuat {formatDateShort(project.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Pencil size={16} className="text-gray-400 hover:text-primary-600" />
                  </button>
                  <button
                    onClick={() => setDeleteId(project.id)}
                    className="p-2 rounded-xl hover:bg-destructive-50 dark:hover:bg-destructive-900/20 transition-colors"
                  >
                    <Trash2 size={16} className="text-gray-400 hover:text-destructive-500" />
                  </button>
                </div>
              </div>

              {/* Mobile actions */}
              <div className="flex gap-2 mt-3 md:hidden">
                <button
                  onClick={() => handleEdit(project)}
                  className="flex-1 btn-ghost text-xs border border-gray-200 dark:border-gray-700 rounded-xl py-2 flex items-center justify-center gap-1.5"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => setDeleteId(project.id)}
                  className="flex-1 btn-ghost text-xs border border-gray-200 dark:border-gray-700 rounded-xl py-2 flex items-center justify-center gap-1.5 text-destructive-500"
                >
                  <Trash2 size={14} /> Hapus
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        !showForm && (
          <EmptyState
            icon={FolderOpen}
            title="Belum Ada Proyek"
            description="Buat proyek tanaman pertama Anda untuk memulai prediksi panen cerdas"
            action={
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={18} />
                Buat Proyek Baru
              </button>
            }
          />
        )
      )}

      {/* FAB for mobile */}
      {!showForm && projects.length > 0 && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { setEditingProject(null); setShowForm(true); }}
          className="fab md:hidden"
        >
          <Plus size={24} />
        </motion.button>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Proyek"
        message="Apakah Anda yakin ingin menghapus proyek ini? Data yang terkait juga akan terhapus."
        confirmText="Ya, Hapus"
      />
    </div>
  );
}
