-- ======================================
-- 📘 DragonBall Quiz - Database Schema
-- Autor: [Tu nombre o alias profesional]
-- Fecha: 2025-10
-- Descripción:
--   Esquema de base de datos para gestionar jugadores,
--   partidos y estadísticas del proyecto DragonBall Quiz.
-- ======================================

-- Extensión necesaria para generar UUIDs automáticamente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================================
-- 🧍 Tabla: jugadores
-- ======================================
CREATE TABLE IF NOT EXISTS jugadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  puntuacion INTEGER DEFAULT 0 NOT NULL,
  imagen_url TEXT,
  descripcion TEXT,
  juegos_ganados INTEGER DEFAULT 0 NOT NULL,
  dobles_faltas INTEGER DEFAULT 0 NOT NULL,
  partidos_jugados INTEGER DEFAULT 0 NOT NULL,
  partidos_ganados INTEGER DEFAULT 0 NOT NULL,
  partidos_perdidos INTEGER DEFAULT 0 NOT NULL,
  partidos_empatados INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================
-- 🎾 Tabla: partidos
-- ======================================
CREATE TABLE IF NOT EXISTS partidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha DATE NOT NULL,
  jugador_1_id UUID REFERENCES jugadores(id) ON DELETE CASCADE NOT NULL,
  jugador_2_id UUID REFERENCES jugadores(id) ON DELETE CASCADE NOT NULL,
  jugador_3_id UUID REFERENCES jugadores(id) ON DELETE CASCADE NOT NULL,
  jugador_4_id UUID REFERENCES jugadores(id) ON DELETE CASCADE NOT NULL,
  score_equipo_1 INTEGER NOT NULL CHECK (score_equipo_1 >= 0),
  score_equipo_2 INTEGER NOT NULL CHECK (score_equipo_2 >= 0),
  lugar TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  sets_equipo_1 INTEGER DEFAULT 0,
  sets_equipo_2 INTEGER DEFAULT 0,
  juegos_set1_equipo1 INTEGER DEFAULT 0,
  juegos_set1_equipo2 INTEGER DEFAULT 0,
  juegos_set2_equipo1 INTEGER DEFAULT 0,
  juegos_set2_equipo2 INTEGER DEFAULT 0,
  juegos_set3_equipo1 INTEGER DEFAULT 0,
  juegos_set3_equipo2 INTEGER DEFAULT 0,
  df_jugador_1 INTEGER DEFAULT 0 NOT NULL,
  df_jugador_2 INTEGER DEFAULT 0 NOT NULL,
  df_jugador_3 INTEGER DEFAULT 0 NOT NULL,
  df_jugador_4 INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT jugadores_unicos CHECK (
    jugador_1_id <> jugador_2_id AND
    jugador_3_id <> jugador_4_id AND
    jugador_1_id <> jugador_3_id AND
    jugador_1_id <> jugador_4_id AND
    jugador_2_id <> jugador_3_id AND
    jugador_2_id <> jugador_4_id
  )
);

-- ======================================
-- 🪣 Configuración de almacenamiento (Supabase)
-- ======================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('jugadores', 'jugadores', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read jugador images"
ON storage.objects FOR SELECT
USING (bucket_id = 'jugadores');

CREATE POLICY "Public can upload jugador images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'jugadores');

-- ======================================
-- ⚙️ Función: actualizar_stats
-- ======================================
CREATE OR REPLACE FUNCTION actualizar_stats(
  p_j1 UUID, p_j2 UUID, p_j3 UUID, p_j4 UUID,
  p_puntos_eq1 INTEGER, p_puntos_eq2 INTEGER,
  p_juegos_eq1 INTEGER, p_juegos_eq2 INTEGER,
  p_df_j1 INTEGER, p_df_j2 INTEGER, p_df_j3 INTEGER, p_df_j4 INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE jugadores SET puntuacion = puntuacion + p_puntos_eq1 WHERE id IN (p_j1, p_j2);
  UPDATE jugadores SET puntuacion = puntuacion + p_puntos_eq2 WHERE id IN (p_j3, p_j4);

  UPDATE jugadores SET juegos_ganados = juegos_ganados + p_juegos_eq1 WHERE id IN (p_j1, p_j2);
  UPDATE jugadores SET juegos_ganados = juegos_ganados + p_juegos_eq2 WHERE id IN (p_j3, p_j4);

  UPDATE jugadores SET dobles_faltas = dobles_faltas + p_df_j1 WHERE id = p_j1;
  UPDATE jugadores SET dobles_faltas = dobles_faltas + p_df_j2 WHERE id = p_j2;
  UPDATE jugadores SET dobles_faltas = dobles_faltas + p_df_j3 WHERE id = p_j3;
  UPDATE jugadores SET dobles_faltas = dobles_faltas + p_df_j4 WHERE id = p_j4;

  UPDATE jugadores SET partidos_jugados = partidos_jugados + 1 WHERE id IN (p_j1, p_j2, p_j3, p_j4);

  IF p_puntos_eq1 > p_puntos_eq2 THEN
    UPDATE jugadores SET partidos_ganados = partidos_ganados + 1 WHERE id IN (p_j1, p_j2);
    UPDATE jugadores SET partidos_perdidos = partidos_perdidos + 1 WHERE id IN (p_j3, p_j4);
  ELSIF p_puntos_eq2 > p_puntos_eq1 THEN
    UPDATE jugadores SET partidos_ganados = partidos_ganados + 1 WHERE id IN (p_j3, p_j4);
    UPDATE jugadores SET partidos_perdidos = partidos_perdidos + 1 WHERE id IN (p_j1, p_j2);
  ELSE
    UPDATE jugadores SET partidos_empatados = partidos_empatados + 1 WHERE id IN (p_j1, p_j2, p_j3, p_j4);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================
-- ⚙️ Función: revertir_stats
-- ======================================
CREATE OR REPLACE FUNCTION revertir_stats(
  p_j1 UUID, p_j2 UUID, p_j3 UUID, p_j4 UUID,
  p_puntos_eq1 INTEGER, p_puntos_eq2 INTEGER,
  p_juegos_eq1 INTEGER, p_juegos_eq2 INTEGER,
  p_df_j1 INTEGER, p_df_j2 INTEGER, p_df_j3 INTEGER, p_df_j4 INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE jugadores SET puntuacion = GREATEST(0, puntuacion - p_puntos_eq1) WHERE id IN (p_j1, p_j2);
  UPDATE jugadores SET puntuacion = GREATEST(0, puntuacion - p_puntos_eq2) WHERE id IN (p_j3, p_j4);

  UPDATE jugadores SET juegos_ganados = GREATEST(0, juegos_ganados - p_juegos_eq1) WHERE id IN (p_j1, p_j2);
  UPDATE jugadores SET juegos_ganados = GREATEST(0, juegos_ganados - p_juegos_eq2) WHERE id IN (p_j3, p_j4);

  UPDATE jugadores SET dobles_faltas = GREATEST(0, dobles_faltas - p_df_j1) WHERE id = p_j1;
  UPDATE jugadores SET dobles_faltas = GREATEST(0, dobles_faltas - p_df_j2) WHERE id = p_j2;
  UPDATE jugadores SET dobles_faltas = GREATEST(0, dobles_faltas - p_df_j3) WHERE id = p_j3;
  UPDATE jugadores SET dobles_faltas = GREATEST(0, dobles_faltas - p_df_j4) WHERE id = p_j4;

  UPDATE jugadores SET partidos_jugados = GREATEST(0, partidos_jugados - 1) WHERE id IN (p_j1, p_j2, p_j3, p_j4);

  IF p_puntos_eq1 > p_puntos_eq2 THEN
    UPDATE jugadores SET partidos_ganados = GREATEST(0, partidos_ganados - 1) WHERE id IN (p_j1, p_j2);
    UPDATE jugadores SET partidos_perdidos = GREATEST(0, partidos_perdidos - 1) WHERE id IN (p_j3, p_j4);
  ELSIF p_puntos_eq2 > p_puntos_eq1 THEN
    UPDATE jugadores SET partidos_ganados = GREATEST(0, partidos_ganados - 1) WHERE id IN (p_j3, p_j4);
    UPDATE jugadores SET partidos_perdidos = GREATEST(0, partidos_perdidos - 1) WHERE id IN (p_j1, p_j2);
  ELSE
    UPDATE jugadores SET partidos_empatados = GREATEST(0, partidos_empatados - 1) WHERE id IN (p_j1, p_j2, p_j3, p_j4);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================
-- ⚙️ Trigger: revertir_stats al eliminar un partido
-- ======================================
CREATE OR REPLACE FUNCTION on_partido_delete()
RETURNS TRIGGER AS $$
DECLARE
  puntos_eq1 INTEGER := 0;
  puntos_eq2 INTEGER := 0;
  juegos_eq1 INTEGER := 0;
  juegos_eq2 INTEGER := 0;
BEGIN
  juegos_eq1 := COALESCE(OLD.juegos_set1_equipo1, 0) + COALESCE(OLD.juegos_set2_equipo1, 0) + COALESCE(OLD.juegos_set3_equipo1, 0);
  juegos_eq2 := COALESCE(OLD.juegos_set1_equipo2, 0) + COALESCE(OLD.juegos_set2_equipo2, 0) + COALESCE(OLD.juegos_set3_equipo2, 0);

  IF OLD.score_equipo_1 > OLD.score_equipo_2 THEN
    puntos_eq1 := 3; puntos_eq2 := 0;
  ELSIF OLD.score_equipo_1 < OLD.score_equipo_2 THEN
    puntos_eq1 := 0; puntos_eq2 := 3;
  ELSE
    puntos_eq1 := 1; puntos_eq2 := 1;
  END IF;

  PERFORM revertir_stats(
    OLD.jugador_1_id, OLD.jugador_2_id, OLD.jugador_3_id, OLD.jugador_4_id,
    puntos_eq1, puntos_eq2, juegos_eq1, juegos_eq2,
    COALESCE(OLD.df_jugador_1, 0), COALESCE(OLD.df_jugador_2, 0),
    COALESCE(OLD.df_jugador_3, 0), COALESCE(OLD.df_jugador_4, 0)
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS after_delete_partido ON partidos;

CREATE TRIGGER after_delete_partido
AFTER DELETE ON partidos
FOR EACH ROW
EXECUTE FUNCTION on_partido_delete();

-- ======================================
-- 🔐 Permisos (para desarrollo local o Supabase)
-- ======================================
GRANT USAGE ON SCHEMA public TO public;
GRANT ALL ON ALL TABLES IN SCHEMA public TO public;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO public;

-- En Supabase (opcional):
-- GRANT USAGE ON SCHEMA public TO anon, authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
