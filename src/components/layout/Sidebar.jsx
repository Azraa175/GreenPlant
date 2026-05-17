import { NavLink, useLocation } from 'react-router-dom';
import { Home, FolderOpen, FileInput, LineChart, History, BookOpen, User, ChevronLeft, ChevronRight, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Beranda' },
  { to: '/proyek', icon: FolderOpen, label: 'Proyek Tanaman' },
  { to: '/input-data', icon: FileInput, label: 'Input Data' },
  { to: '/prediksi', icon: LineChart, label: 'Prediksi' },
  { to: '/riwayat', icon: History, label: 'Riwayat' },
  { to: '/rekomendasi', icon: BookOpen, label: 'Rekomendasi' },
  { to: '/profil', icon: User, label: 'Profil & Pengaturan' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={`hidden md:flex fixed top-0 left-0 h-full z-40 flex-col bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64 lg:w-72'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-gray-100 dark:border-gray-800/50">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-md shrink-0">
          <Leaf size={22} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <h1 className="font-display font-extrabold text-xl text-primary-600 dark:text-primary-400 whitespace-nowrap">
                GreenPlant
              </h1>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-display whitespace-nowrap">
                Prediksi Panen Cerdas
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarIndicator"
                  className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={20} className="relative z-10 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative z-10 font-display font-medium text-sm whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span className="text-xs font-display">Ciutkan</span>}
        </button>
      </div>
    </aside>
  );
}
