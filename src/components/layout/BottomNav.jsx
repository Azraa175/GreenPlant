import { NavLink, useLocation } from 'react-router-dom';
import { Home, FolderOpen, FileInput, LineChart, History, User } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Beranda' },
  { to: '/proyek', icon: FolderOpen, label: 'Proyek' },
  { to: '/input-data', icon: FileInput, label: 'Input' },
  { to: '/prediksi', icon: LineChart, label: 'Prediksi' },
  { to: '/riwayat', icon: History, label: 'Riwayat' },
  { to: '/profil', icon: User, label: 'Profil' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 shadow-nav">
        <div className="flex items-center justify-around px-2 pt-2" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink key={to} to={to} className="relative nav-item">
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -inset-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={22}
                    className={`relative z-10 transition-colors duration-200 ${
                      isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
                    }`}
                  />
                </div>
                <span className={`text-[10px] font-display font-medium mt-0.5 transition-colors duration-200 ${
                  isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
