import TooltipJugador from './TooltipJugador';

const JugadoresLista = ({ jugadores }) => {
  if (!jugadores?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Aún no hay jugadores registrados.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Pos</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Jugador</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">PJ</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">G</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">P</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Juegos</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">DF</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Puntos</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Tend.</th>
          </tr>
        </thead>
        <tbody>
          {jugadores.map((jugador, index) => {
            const posicion = index + 1;
            const victorias = Math.floor(jugador.puntuacion / 3);
            const derrotas = Math.max(0, victorias - 2); // placeholder si no llevas PJ en DB
            const partidosJugados = victorias + derrotas;
            const porcentajeVictorias = partidosJugados > 0 ? Math.round((victorias / partidosJugados) * 100) : 0;

            return (
              <tr key={jugador.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                <td className="py-4 px-4">{posicion}</td>
                <td className="py-4 px-4">
                  <TooltipJugador jugador={jugador}>
                    <div className="flex items-center space-x-3 cursor-pointer">
                      <img src={jugador.imagen_url || 'https://via.placeholder.com/40'} alt={jugador.nombre} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-medium">{jugador.nombre}</p>
                        <p className="text-sm text-gray-400">{porcentajeVictorias}% victorias</p>
                      </div>
                    </div>
                  </TooltipJugador>
                </td>
                <td className="py-4 px-4 text-center"><span className="font-medium">{partidosJugados}</span></td>
                <td className="py-4 px-4 text-center"><span className="text-green-400 font-medium">{victorias}</span></td>
                <td className="py-4 px-4 text-center"><span className="text-red-400 font-medium">{derrotas}</span></td>
                <td className="py-4 px-4 text-center"><span className="font-medium">{jugador.juegos_ganados || 0}</span></td>
                <td className="py-4 px-4 text-center"><span className="font-medium">{jugador.dobles_faltas || 0}</span></td>
                <td className="py-4 px-4 text-center"><span className="font-bold">{jugador.puntuacion}</span></td>
                <td className="py-4 px-4 text-center">
                  <div className="flex justify-center">
                    {porcentajeVictorias >= 60 ? (
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    ) : porcentajeVictorias <= 40 ? (
                      <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default JugadoresLista;