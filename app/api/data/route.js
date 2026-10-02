import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isSupabaseConfigured, getSupabaseData, saveSupabaseData } from '../../../lib/supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

function ensureLocalDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const initial = {
      players: null,
      matches: [],
      attendance: {},
      slots: null,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
  }
}

function readLocalData() {
  ensureLocalDataFile();
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(content || '{}');
  } catch (e) {
    return { players: null, matches: [], attendance: {}, slots: null };
  }
}

function writeLocalData(data) {
  ensureLocalDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export async function GET() {
  try {
    // 1. Try Supabase first if configured
    if (isSupabaseConfigured()) {
      const supaData = await getSupabaseData();
      if (supaData) {
        return NextResponse.json({
          players: supaData.players,
          matches: supaData.matches || [],
          attendance: supaData.attendance || {},
          slots: supaData.slots,
          updatedAt: supaData.updated_at,
          source: 'supabase',
        });
      }
    }

    // 2. Fallback to Local Server JSON file
    const localData = readLocalData();
    return NextResponse.json({
      ...localData,
      source: isSupabaseConfigured() ? 'supabase_fallback' : 'local_server',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const updatedAt = new Date().toISOString();

    // 1. Save to Supabase if configured
    if (isSupabaseConfigured()) {
      await saveSupabaseData({
        players: body.players,
        matches: body.matches,
        attendance: body.attendance,
        slots: body.slots,
      });
    }

    // 2. Also save to local server file as persistent backup
    const current = readLocalData();
    const updated = {
      ...current,
      ...body,
      updatedAt,
    };
    writeLocalData(updated);

    return NextResponse.json({
      success: true,
      updatedAt,
      source: isSupabaseConfigured() ? 'supabase' : 'local_server',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
