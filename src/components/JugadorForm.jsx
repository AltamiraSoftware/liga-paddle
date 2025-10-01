import { useState } from 'react';
import { crearJugador } from '../services/jugadores';
import { subirImagen } from '../services/Storage';

const JugadorForm = ({ onCreated }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagenPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      setErrorMsg('El nombre es obligatorio');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      let imagenUrl = null;
      
      // Subir imagen si se seleccionó una
      if (imagen) {
        imagenUrl = await subirImagen(imagen, nombre);
      }

      // Crear jugador
      await crearJugador({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        imagen_url: imagenUrl
      });

      // Limpiar formulario
      setNombre('');
      setDescripcion('');
      setImagen(null);
      setImagenPreview(null);
      
      onCreated?.();
    } catch (err) {
      const errorMessage = err?.message || err?.error?.message || 'Error al crear jugador';
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Añadir Jugador</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
            placeholder="Nombre del jugador"
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
            placeholder="Biografía o descripción del jugador"
            rows={3}
          />
        </div>

        {/* Imagen */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Foto de perfil</label>
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleImagenChange}
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-600"
            />
            
            {imagenPreview && (
              <div className="flex justify-center">
                <img
                  src={imagenPreview}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-600"
                />
              </div>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">{errorMsg}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-medium py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creando...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span>Añadir Jugador</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default JugadorForm;