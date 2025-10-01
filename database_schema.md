create database DragonBallQuiz;
CREATE TABLE jugadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
  nombre TEXT NOT NULL, 
  puntuacion INTEGER DEFAULT 0 NOT NULL, 
  
  -- Nuevo: URL donde se aloja la imagen de perfil del jugador
  imagen_url TEXT,
  
  -- Nuevo: Un texto para una pequeña biografía o descripción del jugador
  descripcion TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE partidos (
  -- Clave Primaria: Identificador único del partido
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
  
  -- Fecha en la que se jugó el partido.
  fecha DATE NOT NULL,
  
  -- Equipo 1
  -- Referencias al ID del jugador 1 (Clave Externa)
  jugador_1_id UUID REFERENCES jugadores(id) ON DELETE CASCADE NOT NULL, 
  -- Referencias al ID del jugador 2 (Clave Externa)
  jugador_2_id UUID REFERENCES jugadores(id) ON DELETE CASCADE NOT NULL, 
  -- Puntuación (ej: sets ganados) del Equipo 1.
  score_equipo_1 INTEGER NOT NULL CHECK (score_equipo_1 >= 0),
  
  -- Equipo 2
  -- Referencias al ID del jugador 3 (Clave Externa)
  jugador_3_id UUID REFERENCES jugadores(id) ON DELETE CASCADE NOT NULL, 
  -- Referencias al ID del jugador 4 (Clave Externa)
  jugador_4_id UUID REFERENCES jugadores(id) ON DELETE CASCADE NOT NULL, 
  -- Puntuación (ej: sets ganados) del Equipo 2.
  score_equipo_2 INTEGER NOT NULL CHECK (score_equipo_2 >= 0),
  
  -- Restricción para asegurar que los 4 jugadores sean distintos
  CONSTRAINT jugadores_unicos CHECK (
    jugador_1_id <> jugador_2_id AND
    jugador_3_id <> jugador_4_id AND
    jugador_1_id <> jugador_3_id AND
    jugador_1_id <> jugador_4_id AND
    jugador_2_id <> jugador_3_id AND
    jugador_2_id <> jugador_4_id 
  ),
  
  -- Para saber cuándo se registró el partido en la DB.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Bucket público (si no lo creaste desde el dashboard)
insert into storage.buckets (id, name, public) values ('jugadores', 'jugadores', true)
on conflict (id) do nothing;

-- Permitir leer imágenes del bucket
create policy "Public can read jugador images"
on storage.objects for select
using (bucket_id = 'jugadores');

-- Permitir subir imágenes al bucket
create policy "Public can upload jugador images"
on storage.objects for insert
with check (bucket_id = 'jugadores');-- Añadir columnas a la tabla partidos
ALTER TABLE partidos 
ADD COLUMN lugar TEXT,
ADD COLUMN timestamp TIMESTAMPTZ DEFAULT NOW();
-- Función para actualizar puntuaciones
CREATE OR REPLACE FUNCTION actualizar_puntuaciones(
  jugador_1_id UUID,
  jugador_2_id UUID,
  jugador_3_id UUID,
  jugador_4_id UUID,
  puntos_equipo_1 INTEGER,
  puntos_equipo_2 INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Actualizar jugadores del equipo 1
  UPDATE jugadores 
  SET puntuacion = puntuacion + puntos_equipo_1 
  WHERE id IN (jugador_1_id, jugador_2_id);
  
  -- Actualizar jugadores del equipo 2
  UPDATE jugadores 
  SET puntuacion = puntuacion + puntos_equipo_2 
  WHERE id IN (jugador_3_id, jugador_4_id);
END;
$$ LANGUAGE plpgsql;
-- Añadir columnas para lógica de pádel
ALTER TABLE partidos 
ADD COLUMN sets_equipo_1 INTEGER DEFAULT 0,
ADD COLUMN sets_equipo_2 INTEGER DEFAULT 0,
ADD COLUMN juegos_set1_equipo1 INTEGER DEFAULT 0,
ADD COLUMN juegos_set1_equipo2 INTEGER DEFAULT 0,
ADD COLUMN juegos_set2_equipo1 INTEGER DEFAULT 0,
ADD COLUMN juegos_set2_equipo2 INTEGER DEFAULT 0,
ADD COLUMN juegos_set3_equipo1 INTEGER DEFAULT 0,
ADD COLUMN juegos_set3_equipo2 INTEGER DEFAULT 0;
-- Resetear todas las puntuaciones a 0
UPDATE jugadores SET puntuacion = 0;

-- Recalcular puntuaciones basándose en los partidos existentes
UPDATE jugadores 
SET puntuacion = (
  SELECT COALESCE(SUM(
    CASE 
      WHEN p.score_equipo_1 > p.score_equipo_2 AND (p.jugador_1_id = jugadores.id OR p.jugador_2_id = jugadores.id) THEN 3
      WHEN p.score_equipo_1 < p.score_equipo_2 AND (p.jugador_3_id = jugadores.id OR p.jugador_4_id = jugadores.id) THEN 3
      WHEN p.score_equipo_1 = p.score_equipo_2 THEN 1
      ELSE 0
    END
  ), 0)
  FROM partidos p
  WHERE p.jugador_1_id = jugadores.id 
     OR p.jugador_2_id = jugadores.id 
     OR p.jugador_3_id = jugadores.id 
     OR p.jugador_4_id = jugadores.id
);
-- NUEVAS COLUMNAS EN jugadores
ALTER TABLE jugadores
ADD COLUMN IF NOT EXISTS juegos_ganados INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS dobles_faltas INTEGER DEFAULT 0 NOT NULL;

-- NUEVAS COLUMNAS EN partidos (dobles faltas por jugador)
ALTER TABLE partidos
ADD COLUMN IF NOT EXISTS df_jugador_1 INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS df_jugador_2 INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS df_jugador_3 INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS df_jugador_4 INTEGER DEFAULT 0 NOT NULL;

-- RPC: sumar estadísticas tras crear partido
CREATE OR REPLACE FUNCTION actualizar_stats(
  p_j1 UUID, p_j2 UUID, p_j3 UUID, p_j4 UUID,
  p_puntos_eq1 INTEGER, p_puntos_eq2 INTEGER,
  p_juegos_eq1 INTEGER, p_juegos_eq2 INTEGER,
  p_df_j1 INTEGER, p_df_j2 INTEGER, p_df_j3 INTEGER, p_df_j4 INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- puntos
  UPDATE jugadores SET puntuacion = puntuacion + p_puntos_eq1 WHERE id IN (p_j1, p_j2);
  UPDATE jugadores SET puntuacion = puntuacion + p_puntos_eq2 WHERE id IN (p_j3, p_j4);
  -- juegos ganados por equipo
  UPDATE jugadores SET juegos_ganados = juegos_ganados + p_juegos_eq1 WHERE id IN (p_j1, p_j2);
  UPDATE jugadores SET juegos_ganados = juegos_ganados + p_juegos_eq2 WHERE id IN (p_j3, p_j4);
  -- dobles faltas por jugador
  UPDATE jugadores SET dobles_faltas = dobles_faltas + p_df_j1 WHERE id = p_j1;
  UPDATE jugadores SET dobles_faltas = dobles_faltas + p_df_j2 WHERE id = p_j2;
  UPDATE jugadores SET dobles_faltas = dobles_faltas + p_df_j3 WHERE id = p_j3;
  UPDATE jugadores SET dobles_faltas = dobles_faltas + p_df_j4 WHERE id = p_j4;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: revertir estadísticas al eliminar partido
CREATE OR REPLACE FUNCTION revertir_stats(
  p_j1 UUID, p_j2 UUID, p_j3 UUID, p_j4 UUID,
  p_puntos_eq1 INTEGER, p_puntos_eq2 INTEGER,
  p_juegos_eq1 INTEGER, p_juegos_eq2 INTEGER,
  p_df_j1 INTEGER, p_df_j2 INTEGER, p_df_j3 INTEGER, p_df_j4 INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- revertir puntos
  UPDATE jugadores SET puntuacion = GREATEST(0, puntuacion - p_puntos_eq1) WHERE id IN (p_j1, p_j2);
  UPDATE jugadores SET puntuacion = GREATEST(0, puntuacion - p_puntos_eq2) WHERE id IN (p_j3, p_j4);
  -- revertir juegos
  UPDATE jugadores SET juegos_ganados = GREATEST(0, juegos_ganados - p_juegos_eq1) WHERE id IN (p_j1, p_j2);
  UPDATE jugadores SET juegos_ganados = GREATEST(0, juegos_ganados - p_juegos_eq2) WHERE id IN (p_j3, p_j4);
  -- revertir dobles faltas
  UPDATE jugadores SET dobles_faltas = GREATEST(0, dobles_faltas - p_df_j1) WHERE id = p_j1;
  UPDATE jugadores SET dobles_faltas = GREATEST(0, dobles_faltas - p_df_j2) WHERE id = p_j2;
  UPDATE jugadores SET dobles_faltas = GREATEST(0, dobles_faltas - p_df_j3) WHERE id = p_j3;
  UPDATE jugadores SET dobles_faltas = GREATEST(0, dobles_faltas - p_df_j4) WHERE id = p_j4;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;