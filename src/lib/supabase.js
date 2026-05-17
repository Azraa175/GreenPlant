import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL_HERE') {
  console.warn(
    '⚠️ Supabase belum dikonfigurasi. Edit file .env dengan URL dan Anon Key dari Supabase Dashboard.\n' +
    'App akan menggunakan localStorage sebagai fallback.'
  );
}

export const supabase = supabaseUrl && supabaseUrl !== 'YOUR_SUPABASE_URL_HERE'
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => !!supabase;
