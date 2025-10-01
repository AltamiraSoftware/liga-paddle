import { useState, useEffect } from 'react';
import { crearPartido } from '../services/partidos';
import { listarJugadores } from '../services/jugadores';

const PartidoForm = ({ onCreated }) => {
  const [jugadores, setJugadores] = useState([]);
  const [fecha, setFecha] = useState('');
  const [lugar, setLugar] = useState('');
  const [jugador1Id, setJugador1Id] = useState('');
  const [jugador2Id, setJugador2Id] = useState('');
  const [jugador3Id, setJugador3Id] = useState('');
  const [jugador4Id, setJugador4Id] = useState('');

  // Juegos por set
  const [j11, setJ11] = useState(0); // set1 equipo1
  const [j12, setJ12] = useState(0); // set1 equipo2
  const [j21, setJ21] = useState(0); // set2 equipo1
  const [j22, setJ22] = useState(0); // set2 equipo2
  const [j31, setJ31] = useState(0); // set3 equipo1
  const [j32, setJ32] = useState(0); // set3 equipo2

  // Dobles faltas por jugador
  const [df1, setDf1] = useState(0);
  const [df2, setDf2] = useState(0);
  const [df3, setDf3] = useState(0);
  const [df4, setDf4] = useState(0);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const cargarJugadores = async () => {
      try {
        const data = await listarJugadores();
        setJugadores(data);
      } catch {
        setErrorMsg('Error al cargar jugadores');
      }
    };
    cargarJugadores();
  }, []);

  const setsFromJuegos = () => {
    const s1 = j11 > j12 ? 1 : (j12 > j11 ? -1 : 0);
    const s2 = j21 > j22 ? 1 : (j22 > j21 ? -1 : 0);
    const s3 = j31 > j32 ? 1 : (j32 > j31 ? -1 : 0);
    
    const eq1 = [s1, s2, s3].filter(v => v === 1).length;
    const eq2 = [s1, s2, s3].filter(v => v === -1).length;
    
    // Validar empate 1-1: el tercer set debe completarse
    if (eq1 === 1 && eq2 === 1) {
      const set3Completado = (j31 >= 6 && j32 < j31) || (j32 >= 6 && j31 < j32) || 
                            (j31 === 7 && j32 === 6) || (j32 === 7 && j31 === 6);
      if (!set3Completado) {
        return { sets1: 1, sets2: 1, empate: true }; // Empate si no se completa el 3er set
      }
    }
    
    return { sets1: eq1, sets2: eq2, empate: false };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fecha || !lugar || !jugador1Id || !jugador2Id || !jugador3Id || !jugador4Id) {
      setErrorMsg('Todos los campos son obligatorios');
      return;
    }
    if (jugador1Id === jugador2Id || jugador3Id === jugador4Id || 
        jugador1Id === jugador3Id || jugador1Id === jugador4Id ||
        jugador2Id === jugador3Id || jugador2Id === jugador4Id) {
      setErrorMsg('Los jugadores deben ser diferentes');
      return;
    }

    const { sets1, sets2, empate } = setsFromJuegos();
    if (sets1 === 0 && sets2 === 0) {
      setErrorMsg('Debes introducir al menos un set válido');
      return;
    }
    
    if (empate) {
      setErrorMsg('Si hay empate 1-1 en sets, el tercer set debe completarse (6-x o 7-6)');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      await crearPartido({
        fecha,
        lugar,
        jugador_1_id: jugador1Id,
        jugador_2_id: jugador2Id,
        jugador_3_id: jugador3Id,
        jugador_4_id: jugador4Id,
        sets_equipo_1: sets1,
        sets_equipo_2: sets2,
        juegos_set1_equipo1: j11,
        juegos_set1_equipo2: j12,
        juegos_set2_equipo1: j21,
        juegos_set2_equipo2: j22,
        juegos_set3_equipo1: j31,
        juegos_set3_equipo2: j32,
        df_jugador_1: df1,
        df_jugador_2: df2,
        df_jugador_3: df3,
        df_jugador_4: df4
      });

      // Limpiar formulario
      setFecha('');
      setLugar('');
      setJugador1Id('');
      setJugador2Id('');
      setJugador3Id('');
      setJugador4Id('');
      setJ11(0); setJ12(0); setJ21(0); setJ22(0); setJ31(0); setJ32(0);
      setDf1(0); setDf2(0); setDf3(0); setDf4(0);

      onCreated?.();
    } catch (err) {
      const errorMessage = err?.message || err?.error?.message || 'Error al crear partido';
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const numberInput = (value, onChange, className = 'w-16') => (
    <input
      type="number"
      min="0"
      max="7"
      value={value}
      onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
      className={`${className} text-center bg-gray-700/50 border border-gray-600/50 rounded-lg px-2 py-2 text-white font-bold`}
    />
  );

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Registrar Partido</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fecha y Lugar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Fecha</label>
            <input 
              type="date" 
              value={fecha} 
              onChange={(e) => setFecha(e.target.value)} 
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Lugar</label>
            <input 
              value={lugar} 
              onChange={(e) => setLugar(e.target.value)} 
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" 
              placeholder="Cancha Central" 
              required 
            />
          </div>
        </div>

        {/* Jugadores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Equipo A</label>
            <div className="space-y-2">
              <select 
                value={jugador1Id} 
                onChange={(e) => setJugador1Id(e.target.value)} 
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" 
                required
              >
                <option value="">Jugador 1</option>
                {jugadores.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
              </select>
              <select 
                value={jugador2Id} 
                onChange={(e) => setJugador2Id(e.target.value)} 
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" 
                required
              >
                <option value="">Jugador 2</option>
                {jugadores.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Equipo B</label>
            <div className="space-y-2">
              <select 
                value={jugador3Id} 
                onChange={(e) => setJugador3Id(e.target.value)} 
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" 
                required
              >
                <option value="">Jugador 3</option>
                {jugadores.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
              </select>
              <select 
                value={jugador4Id} 
                onChange={(e) => setJugador4Id(e.target.value)} 
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" 
                required
              >
                <option value="">Jugador 4</option>
                {jugadores.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Resultado por sets (como la imagen) */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Resultado</label>
          <div className="grid grid-cols-4 gap-4 items-center">
            <div></div>
            <div className="text-center text-sm text-gray-400">Set-1</div>
            <div className="text-center text-sm text-gray-400">Set-2</div>
            <div className="text-center text-sm text-gray-400">Set-3</div>

            <div className="font-semibold">A</div>
            <div className="flex justify-center">{numberInput(j11, setJ11)}</div>
            <div className="flex justify-center">{numberInput(j21, setJ21)}</div>
            <div className="flex justify-center">{numberInput(j31, setJ31)}</div>

            <div className="font-semibold">B</div>
            <div className="flex justify-center">{numberInput(j12, setJ12)}</div>
            <div className="flex justify-center">{numberInput(j22, setJ22)}</div>
            <div className="flex justify-center">{numberInput(j32, setJ32)}</div>
          </div>

          {/* Vista rápida de sets calculados */}
          <div className="mt-2 text-sm text-gray-300">
            {(() => { 
              const s = setsFromJuegos(); 
              return s.empate ? `Sets: A ${s.sets1} - B ${s.sets2} (Empate - Completa el 3er set)` : `Sets: A ${s.sets1} - B ${s.sets2}`; 
            })()}
          </div>
        </div>

        {/* Dobles faltas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Dobles faltas Equipo A</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-xs text-gray-400 mb-1">J1</span>
                {numberInput(df1, setDf1, 'w-full')}
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">J2</span>
                {numberInput(df2, setDf2, 'w-full')}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Dobles faltas Equipo B</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-xs text-gray-400 mb-1">J3</span>
                {numberInput(df3, setDf3, 'w-full')}
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">J4</span>
                {numberInput(df4, setDf4, 'w-full')}
              </div>
            </div>
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
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span>Registrar Partido</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PartidoForm;