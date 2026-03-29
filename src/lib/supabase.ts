import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client (for use in React components)
export const supabase = createClientComponentClient();

// Server-side Supabase client (for use in API routes / server components)
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);
