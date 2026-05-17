import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import { ToastProvider } from './components/ui/Toast';
import './index.css';

// Apply system dark mode preference on load
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = (() => {
  try {
    const settings = JSON.parse(localStorage.getItem('greenplant_settings'));
    return settings?.theme;
  } catch {
    return null;
  }
})();

if (savedTheme === 'dark' || (savedTheme !== 'light' && prefersDark)) {
  document.documentElement.classList.add('dark');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AppDataProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AppDataProvider>
    </AuthProvider>
  </React.StrictMode>
);
