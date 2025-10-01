import { useEffect, useState } from 'react';
import JugadorForm from './components/JugadorForm';
import JugadoresLista from './components/JugadoresLista';
import PartidoForm from './components/PartidoForm';
import HistorialPartidos from './components/HistorialPartidos';
import { listarJugadores } from './services/jugadores';
import { listarPartidos } from './services/partidos';

function App() {
  const [jugadores, setJugadores] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('partido');

  const cargar = async () => {
    setLoading(true);
    try {
      const [jugadoresData, partidosData] = await Promise.all([
        listarJugadores(),
        listarPartidos()
      ]);
      setJugadores(jugadoresData);
      setPartidos(partidosData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Liga de Pádel</h1>
              <p className="text-gray-400 text-sm">Temporada 2025</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{jugadores.length} Jugadores</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{partidos.length} Partidos</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Clasificación General - Altura aumentada para tooltips */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 h-[600px] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Clasificación General</h2>
                  <p className="text-gray-400 text-sm">Actualizado en tiempo real</p>
                </div>
                <div className="bg-gray-700 px-3 py-1 rounded-full">
                  <span className="text-xs font-medium text-green-400">En vivo</span>
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                  <p className="mt-2 text-gray-400">Cargando...</p>
                </div>
              ) : (
                <JugadoresLista jugadores={jugadores} />
              )}
            </div>
          </div>

          {/* Panel Derecho */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              {/* Tabs */}
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('partido')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'partido'
                      ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Partido
                </button>
                <button
                  onClick={() => setActiveTab('jugador')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'jugador'
                      ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Jugador
                </button>
              </div>

              {/* Contenido de Tabs */}
              <div className="p-6">
                {activeTab === 'partido' ? (
                  <PartidoForm onCreated={cargar} />
                ) : (
                  <JugadorForm onCreated={cargar} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Historial de Partidos */}
        <div className="mt-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-6">Historial de Partidos</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="mt-2 text-gray-400">Cargando...</p>
              </div>
            ) : (
              <HistorialPartidos partidos={partidos} onPartidoEditado={cargar} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;