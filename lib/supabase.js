import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://hjcjvcofsikvelxaqmwf.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_u9UEVjK7uEeR8Qke9gyEsw_t1BnXBuG';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

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
 * Fetch global state directly from Supabase (elclasico_data table)
 * Works directly in client browser on phones and PCs!
 */
export async function getSupabaseData() {
  if (!supabase) return null;
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
 * Save global state directly to Supabase with SAFE FIELD-BY-FIELD MERGE
 * Works directly in client browser on phones and PCs!
 */
export async function saveSupabaseData(payload) {
  if (!supabase) return false;
  try {
    const updatedAt = new Date().toISOString();

    // 1. Fetch current row so we preserve any existing columns
    const { data: existing, error: selectErr } = await supabase
      .from('elclasico_data')
      .select('*')
      .eq('id', 'main')
      .maybeSingle();

    if (selectErr && selectErr.code !== 'PGRST116') {
      console.warn('Supabase fetch before save error:', selectErr.message);
    }

    const mergedRow = {
      id: 'main',
      players: payload.players !== undefined && payload.players !== null ? payload.players : (existing?.players || []),
      matches: payload.matches !== undefined && payload.matches !== null ? payload.matches : (existing?.matches || []),
      attendance: payload.attendance !== undefined && payload.attendance !== null ? payload.attendance : (existing?.attendance || {}),
      slots: payload.slots !== undefined && payload.slots !== null ? payload.slots : (existing?.slots || {}),
      updated_at: updatedAt,
    };

    const { error: upsertErr } = await supabase
      .from('elclasico_data')
      .upsert(mergedRow, { onConflict: 'id' });

    if (upsertErr) {
      console.warn('Supabase upsert error:', upsertErr.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Supabase save exception:', err.message);
    return false;
  }
}
