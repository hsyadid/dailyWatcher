import { createClient } from '@supabase/supabase-js';

// Fallback values allow the module to load at build time without throwing.
// At runtime, requests will fail with a clear error if env vars are missing.
const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL      || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
