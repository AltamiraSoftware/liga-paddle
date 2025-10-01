import { supabase } from '../lib/supabaseClient';

export const subirImagen = async (file) => {
  if (!file) return null;

  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = `jugadores/${fileName}`;

  const { error: uploadError } = await supabase
    .storage
    .from('jugadores')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase
    .storage
    .from('jugadores')
    .getPublicUrl(filePath);

  return data.publicUrl; // URL pública
};