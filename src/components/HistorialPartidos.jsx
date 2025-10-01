import { useState } from 'react';
import { editarPartido, eliminarPartido } from '../services/partidos';

const HistorialPartidos = ({ partidos, onPartidoEditado }) => {
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const iniciarEdicion = (partido) => {
    setEditandoId(partido.id);
    setFormData({
      fecha: partido.fecha,
      lugar: partido.lugar,
      sets_equipo_1: partido.sets_equipo_1,
      sets_equipo_2: partido.sets_equipo_2,
      juegos_set1_equipo1: partido.juegos_set1_equipo1,
      juegos_set1_equipo2: partido.juegos_set1_equipo2,
      juegos_set2_equipo1: partido.juegos_set2_equipo1,
      juegos_set2_equipo2: partido.juegos_set2_equipo2,
      juegos_set3_equipo1: partido.juegos_set3_equipo1,
      juegos_set3_equipo2: partido.juegos_set3_equipo2
    });
    setError(null);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormData({});
    setError(null);
  };

  const guardarEdicion = async () => {
    setLoading(true);
    setError(null);
    try {
      await editarPartido(editandoId, formData);
      setEditandoId(null);
      setFormData({});
      onPartidoEditado?.();
    } catch (err) {
      setError(err.message || 'Error al editar partido');
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este partido?')) return;
    
    setLoading(true);
    try {
      await eliminarPartido(id);
      onPartidoEditado?.();
    } catch (err) {
      setError(err.message || 'Error al eliminar partido');
    } finally {
      setLoading(false);
    }
  };

  if (!partidos?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Aún no hay partidos registrados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      {partidos.map((partido) => (
        <div key={partido.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
          {editandoId === partido.id ? (
            // Modo edición
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Lugar</label>
                  <input
                    value={formData.lugar}
                    onChange={(e) => setFormData({...formData, lugar: e.target.value})}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Sets Equipo 1</label>
                  <input
                    type="number"
                    value={formData.sets_equipo_1}
                    onChange={(e) => setFormData({...formData, sets_equipo_1: parseInt(e.target.value) || 0})}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                    min="0"
                    max="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Sets Equipo 2</label>
                  <input
                    type="number"
                    value={formData.sets_equipo_2}
                    onChange={(e) => setFormData({...formData, sets_equipo_2: parseInt(e.target.value) || 0})}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                    min="0"
                    max="2"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={guardarEdicion}
                  disabled={loading}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={cancelarEdicion}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            // Modo visualización
            <>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{partido.lugar}</h3>
                  <p className="text-gray-400 text-sm">
                    {new Date(partido.fecha).toLocaleDateString()} - 
                    {new Date(partido.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {partido.sets_equipo_1} - {partido.sets_equipo_2}
                  </p>
                  <p className="text-gray-400 text-sm">sets</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="bg-gray-600 rounded-lg p-3">
                  <p className="font-medium text-sm text-gray-300 mb-1">Equipo 1</p>
                  <p className="text-sm">{partido.jugador_1?.nombre} + {partido.jugador_2?.nombre}</p>
                </div>
                <div className="bg-gray-600 rounded-lg p-3">
                  <p className="font-medium text-sm text-gray-300 mb-1">Equipo 2</p>
                  <p className="text-sm">{partido.jugador_3?.nombre} + {partido.jugador_4?.nombre}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => iniciarEdicion(partido)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminar(partido.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default HistorialPartidos;