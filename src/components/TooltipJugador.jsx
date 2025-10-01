import { useState } from 'react';

const TooltipJugador = ({ jugador, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div className="absolute z-50 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl min-w-80 top-full left-0 mt-2">
          <div className="flex items-center space-x-3 mb-3">
            <img
              src={jugador.imagen_url || 'https://via.placeholder.com/60'}
              alt={jugador.nombre}
              className="w-15 h-15 rounded-full object-cover"
            />
            <div>
              <h3 className="font-bold text-lg">{jugador.nombre}</h3>
              <p className="text-gray-400 text-sm">Puntos: {jugador.puntuacion}</p>
            </div>
          </div>
          
          {jugador.descripcion && (
            <div className="mb-3">
              <h4 className="font-medium text-sm text-gray-300 mb-1">Descripción</h4>
              <p className="text-sm text-gray-400">{jugador.descripcion}</p>
            </div>
          )}
          
          <div className="text-sm">
            <p className="text-gray-300">Registrado:</p>
            <p className="text-gray-400">{new Date(jugador.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TooltipJugador;