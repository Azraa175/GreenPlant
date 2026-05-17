import { useAuth } from '../../context/AuthContext';
import { Bell, Leaf } from 'lucide-react';
import { getGreeting } from '../../utils/formatters';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-4xl mx-auto md:max-w-none">
        {/* Mobile Logo */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
            <Leaf size={16} className="text-white" />
          </div>
          <span className="font-display font-extrabold text-lg text-primary-600 dark:text-primary-400">
            GreenPlant
          </span>
        </div>

        {/* Desktop greeting */}
        <div className="hidden md:block">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-display">
            {getGreeting()}, <span className="text-gray-900 dark:text-white font-semibold">{user?.name || 'Petani'}</span> 👋
          </p>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Bell size={20} className="text-gray-500 dark:text-gray-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-display font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
