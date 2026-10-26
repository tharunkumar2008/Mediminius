import { createClient } from '@supabase/supabase-js';

// Clean and sanitize Supabase host URL
export const sanitizeSupabaseUrl = (rawUrl) => {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  url = url.replace(/\/rest\/v1\/?$/i, '');
  url = url.replace(/\/auth\/v1\/?$/i, '');
  url = url.replace(/\/+$/, '');
  return url;
};

// Get Supabase credentials from Vite environment or runtime storage
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Also support runtime configured credentials from localStorage for instant admin setup
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('mm_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('mm_supabase_key') : null;

  const rawUrl = (envUrl && envUrl.trim() && !envUrl.includes('your-project-id')) ? envUrl.trim() : (storedUrl || '');
  const url = sanitizeSupabaseUrl(rawUrl);
  const key = (envKey && envKey.trim() && !envKey.includes('your-anon-key-here')) ? envKey.trim() : (storedKey || '');

  return { url, key, isConfigured: Boolean(url && key) };
};

export const isSupabaseConfigured = () => {
  const { isConfigured } = getSupabaseConfig();
  return isConfigured;
};

// Create a single Supabase instance
let supabaseInstance = null;

export const getSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;

  const { url, key, isConfigured } = getSupabaseConfig();
  
  if (isConfigured) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return supabaseInstance;
    } catch (err) {
      console.error('[Supabase Init Error]', err);
    }
  }

  return null;
};

// Helper to update runtime credentials
export const setRuntimeSupabaseConfig = (rawUrl, key) => {
  const url = sanitizeSupabaseUrl(rawUrl);
  if (url && key) {
    localStorage.setItem('mm_supabase_url', url);
    localStorage.setItem('mm_supabase_key', key.trim());
    supabaseInstance = createClient(url, key.trim(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return true;
  }
  return false;
};

export const clearRuntimeSupabaseConfig = () => {
  localStorage.removeItem('mm_supabase_url');
  localStorage.removeItem('mm_supabase_key');
  supabaseInstance = null;
};

export const supabase = getSupabaseClient();
