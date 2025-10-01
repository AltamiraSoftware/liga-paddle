import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
console.log('URL de Supabase leída:', supabaseUrl);
console.log('Clave Anon leída:', supabaseAnonKey ? 'Leída y Oculta' : '¡ERROR: UNDEFINED!');

// Crea un cliente HTTP con auth anónima
export const supabase = createClient(supabaseUrl, supabaseAnonKey);