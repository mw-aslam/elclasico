import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isSupabaseConfigured, getSupabaseData, saveSupabaseData } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

function ensureLocalDataFile() {
  try {
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
  } catch (e) {
    // Read-only filesystem (e.g., Vercel serverless lambda)
  }
}

function readLocalData() {
  try {
    ensureLocalDataFile();
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(content || '{}');
    }
  } catch (e) {
    // Read-only or error
  }
  return { players: null, matches: [], attendance: {}, slots: null };
}

function writeLocalData(data) {
  try {
    ensureLocalDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    // Read-only filesystem on cloud hosts, safely ignore
  }
}

export async function GET() {
  try {
    // 1. Try Supabase first if configured
    if (isSupabaseConfigured()) {
      const supaData = await getSupabaseData();
      if (supaData) {
        return NextResponse.json(
          {
            players: supaData.players,
            matches: supaData.matches || [],
            attendance: supaData.attendance || {},
            slots: supaData.slots,
            updatedAt: supaData.updated_at,
            source: 'supabase',
          },
          {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            },
          }
        );
      }
    }

    // 2. Fallback to Local Server JSON file
    const localData = readLocalData();
    return NextResponse.json(
      {
        ...localData,
        source: isSupabaseConfigured() ? 'supabase_fallback' : 'local_server',
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const updatedAt = new Date().toISOString();

    // 1. Save to Supabase if configured (safe field-by-field merge)
    let supaSuccess = false;
    if (isSupabaseConfigured()) {
      supaSuccess = await saveSupabaseData(body);
    }

    // 2. Also save to local server file as persistent backup
    const current = readLocalData();
    const updated = {
      ...current,
      players: body.players !== undefined ? body.players : current.players,
      matches: body.matches !== undefined ? body.matches : current.matches,
      attendance: body.attendance !== undefined ? body.attendance : current.attendance,
      slots: body.slots !== undefined ? body.slots : current.slots,
      updatedAt,
    };
    writeLocalData(updated);

    return NextResponse.json(
      {
        success: true,
        updatedAt,
        source: supaSuccess ? 'supabase' : 'local_server',
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
