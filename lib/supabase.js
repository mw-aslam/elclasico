import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Fetch global state from Supabase (elclasico_data table)
 */
export async function getSupabaseData() {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('elclasico_data')
      .select('*')
      .eq('id', 'main')
      .maybeSingle();

    if (error) {
      console.warn('Supabase get error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase error:', err.message);
    return null;
  }
}

/**
 * Save global state to Supabase (elclasico_data table)
 */
export async function saveSupabaseData(payload) {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const row = {
      id: 'main',
      ...payload,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('elclasico_data')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase save error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase save exception:', err.message);
    return false;
  }
}
