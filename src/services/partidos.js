import { supabase } from '../lib/supabaseClient';

// SELECT con JOIN para obtener nombres de jugadores
export const listarPartidos = async () => {
  const { data, error } = await supabase
    .from('partidos')
    .select(`
      *,
      jugador_1:jugadores!partidos_jugador_1_id_fkey(nombre),
      jugador_2:jugadores!partidos_jugador_2_id_fkey(nombre),
      jugador_3:jugadores!partidos_jugador_3_id_fkey(nombre),
      jugador_4:jugadores!partidos_jugador_4_id_fkey(nombre)
    `)
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  return data;
};

// INSERT partido y actualizar puntuaciones + estadísticas
export const crearPartido = async ({
  fecha,
  jugador_1_id,
  jugador_2_id,
  jugador_3_id,
  jugador_4_id,
  lugar,
  sets_equipo_1,
  sets_equipo_2,
  juegos_set1_equipo1,
  juegos_set1_equipo2,
  juegos_set2_equipo1,
  juegos_set2_equipo2,
  juegos_set3_equipo1,
  juegos_set3_equipo2,
  df_jugador_1 = 0,
  df_jugador_2 = 0,
  df_jugador_3 = 0,
  df_jugador_4 = 0
}) => {
  // 1) Insertar partido
  const { data: partido, error: partidoError } = await supabase
    .from('partidos')
    .insert([{
      fecha,
      jugador_1_id,
      jugador_2_id,
      score_equipo_1: sets_equipo_1,
      jugador_3_id,
      jugador_4_id,
      score_equipo_2: sets_equipo_2,
      lugar,
      sets_equipo_1,
      sets_equipo_2,
      juegos_set1_equipo1,
      juegos_set1_equipo2,
      juegos_set2_equipo1,
      juegos_set2_equipo2,
      juegos_set3_equipo1,
      juegos_set3_equipo2,
      df_jugador_1,
      df_jugador_2,
      df_jugador_3,
      df_jugador_4,
      timestamp: new Date().toISOString()
    }])
    .select()
    .single();

  if (partidoError) throw partidoError;

  // 2) Calcular puntos: +3 victoria, +1 empate, 0 derrota
  const equipo1Gana = sets_equipo_1 > sets_equipo_2;
  const empate = sets_equipo_1 === sets_equipo_2;
  const puntosEquipo1 = equipo1Gana ? 3 : (empate ? 1 : 0);
  const puntosEquipo2 = !equipo1Gana && !empate ? 3 : (empate ? 1 : 0);

  // 3) Calcular juegos ganados por equipo
  const juegosEq1 = (juegos_set1_equipo1 || 0) + (juegos_set2_equipo1 || 0) + (juegos_set3_equipo1 || 0);
  const juegosEq2 = (juegos_set1_equipo2 || 0) + (juegos_set2_equipo2 || 0) + (juegos_set3_equipo2 || 0);

  // 4) Actualizar estadísticas vía RPC
  const { error: statsError } = await supabase.rpc('actualizar_stats', {
    p_j1: jugador_1_id,
    p_j2: jugador_2_id,
    p_j3: jugador_3_id,
    p_j4: jugador_4_id,
    p_puntos_eq1: puntosEquipo1,
    p_puntos_eq2: puntosEquipo2,
    p_juegos_eq1: juegosEq1,
    p_juegos_eq2: juegosEq2,
    p_df_j1: df_jugador_1,
    p_df_j2: df_jugador_2,
    p_df_j3: df_jugador_3,
    p_df_j4: df_jugador_4
  });

  if (statsError) throw statsError;

  return partido;
};

// UPDATE partido
export const editarPartido = async (id, {
  fecha,
  lugar,
  sets_equipo_1,
  sets_equipo_2,
  juegos_set1_equipo1,
  juegos_set1_equipo2,
  juegos_set2_equipo1,
  juegos_set2_equipo2,
  juegos_set3_equipo1,
  juegos_set3_equipo2,
  df_jugador_1 = 0,
  df_jugador_2 = 0,
  df_jugador_3 = 0,
  df_jugador_4 = 0
}) => {
  const { data, error } = await supabase
    .from('partidos')
    .update({
      fecha,
      lugar,
      sets_equipo_1,
      sets_equipo_2,
      score_equipo_1: sets_equipo_1,
      score_equipo_2: sets_equipo_2,
      juegos_set1_equipo1,
      juegos_set1_equipo2,
      juegos_set2_equipo1,
      juegos_set2_equipo2,
      juegos_set3_equipo1,
      juegos_set3_equipo2,
      df_jugador_1,
      df_jugador_2,
      df_jugador_3,
      df_jugador_4,
      timestamp: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// DELETE partido: revertir stats y borrar
export const eliminarPartido = async (id) => {
  // 1) Leer el partido para conocer sus efectos
  const { data: p, error: readError } = await supabase
    .from('partidos')
    .select('*')
    .eq('id', id)
    .single();
  if (readError) throw readError;

  // 2) Calcular puntos y juegos
  const equipo1Gana = (p.sets_equipo_1 || 0) > (p.sets_equipo_2 || 0);
  const empate = (p.sets_equipo_1 || 0) === (p.sets_equipo_2 || 0);
  const puntosEquipo1 = equipo1Gana ? 3 : (empate ? 1 : 0);
  const puntosEquipo2 = !equipo1Gana && !empate ? 3 : (empate ? 1 : 0);
  const juegosEq1 = (p.juegos_set1_equipo1 || 0) + (p.juegos_set2_equipo1 || 0) + (p.juegos_set3_equipo1 || 0);
  const juegosEq2 = (p.juegos_set1_equipo2 || 0) + (p.juegos_set2_equipo2 || 0) + (p.juegos_set3_equipo2 || 0);

  // 3) Revertir estadísticas
  const { error: revertError } = await supabase.rpc('revertir_stats', {
    p_j1: p.jugador_1_id,
    p_j2: p.jugador_2_id,
    p_j3: p.jugador_3_id,
    p_j4: p.jugador_4_id,
    p_puntos_eq1: puntosEquipo1,
    p_puntos_eq2: puntosEquipo2,
    p_juegos_eq1: juegosEq1,
    p_juegos_eq2: juegosEq2,
    p_df_j1: p.df_jugador_1 || 0,
    p_df_j2: p.df_jugador_2 || 0,
    p_df_j3: p.df_jugador_3 || 0,
    p_df_j4: p.df_jugador_4 || 0
  });
  if (revertError) throw revertError;

  // 4) Borrar el partido
  const { error } = await supabase
    .from('partidos')
    .delete()
    .eq('id', id);

  if (error) throw error;
};