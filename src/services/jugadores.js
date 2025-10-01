import { supabase } from '../lib/supabaseClient';

// SELECT + ORDER BY
export const listarJugadores = async () => {
  const { data, error } = await supabase
    .from('jugadores')          // tabla
    .select('*')                // columnas
    .order('puntuacion', { ascending: false });
  if (error) throw error;       // manejo de error
  return data;                  // array de filas
};

// INSERT
export const crearJugador = async ({ nombre, imagen_url, descripcion }) => {
  const payload = {
    nombre: (nombre || '').trim(),
    imagen_url: imagen_url || null,
    descripcion: descripcion || null,
  };
  const { error } = await supabase.from('jugadores').insert([payload]);
  if (error) throw error;
};