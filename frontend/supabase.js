import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ostnqapfanzuuntmyogc.supabase.co'; // Replace with your Project URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Replace with your Anon Key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
