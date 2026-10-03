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
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      },
    })
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
 * Save global state directly to Supabase with ATOMIC PARTIAL UPDATE
 * Only updates the fields passed in payload, leaving other columns 100% untouched!
 */
export async function saveSupabaseData(payload) {
  if (!supabase || !payload) return false;
  try {
    const updatedAt = new Date().toISOString();
    const updateFields = {
      updated_at: updatedAt,
    };

    if (payload.players !== undefined && payload.players !== null) updateFields.players = payload.players;
    if (payload.matches !== undefined && payload.matches !== null) updateFields.matches = payload.matches;
    if (payload.attendance !== undefined && payload.attendance !== null) updateFields.attendance = payload.attendance;
    if (payload.slots !== undefined && payload.slots !== null) updateFields.slots = payload.slots;

    // 1. Direct atomic partial update on Supabase row
    const { data, error: updateErr } = await supabase
      .from('elclasico_data')
      .update(updateFields)
      .eq('id', 'main')
      .select('id');

    // If row doesn't exist yet, fallback to upsert
    if (updateErr || !data || data.length === 0) {
      const { error: upsertErr } = await supabase
        .from('elclasico_data')
        .upsert({ id: 'main', ...updateFields }, { onConflict: 'id' });

      if (upsertErr) {
        console.warn('Supabase upsert fallback error:', upsertErr.message);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.warn('Supabase save exception:', err.message);
    return false;
  }
}
