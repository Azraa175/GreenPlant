import { motion } from 'framer-motion';
import { Sprout } from 'lucide-react';

export default function EmptyState({ icon: Icon = Sprout, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      {/* Illustration Circle */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
          <Icon size={40} className="text-primary-400 dark:text-primary-500" />
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-200 dark:bg-primary-700 rounded-full animate-pulse-soft" />
        <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-accent-300 dark:bg-accent-600 rounded-full animate-pulse-soft" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 -right-4 w-1.5 h-1.5 bg-primary-300 dark:bg-primary-600 rounded-full animate-pulse-soft" style={{ animationDelay: '1s' }} />
      </div>

      <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mb-6">
        {description}
      </p>

      {action && (
        <motion.div whileTap={{ scale: 0.97 }}>
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
