import { supabase } from '@/lib/customSupabaseClient';

let settingsPromise = null;

export async function getSettings() {
  if (!settingsPromise) {
    settingsPromise = supabase
      .from('settings')
      .select('key, value')
      .then(({ data, error }) => {
        if (error) {
          console.warn('Failed to fetch settings:', error.message);
          return {};
        }
        return Object.fromEntries((data || []).map(row => [row.key, row.value]));
      })
      .catch(err => {
        settingsPromise = null;
        console.warn('Settings fetch error:', err);
        return {};
      });
  }
  return settingsPromise;
}

export function invalidateSettingsCache() {
  settingsPromise = null;
}
