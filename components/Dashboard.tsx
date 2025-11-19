import React, { useState } from 'react';
import { 
  Plane, LayoutDashboard, Users, Bell, Search, 
  LogOut, Clock, MapPin, AlertCircle,
  Sparkles, X, Send, FileText, Briefcase, Shield
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { OperationData, User } from '../types';
import { generateOperationalInsight } from '../services/geminiService';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

// Mock Data translated
const FLIGHT_DATA: OperationData[] = [
  { id: '1', flightNumber: 'AM-492', status: 'On Time', destination: 'Cancún (CUN)', gate: 'B12', time: '14:30', passengerCount: 142 },
  { id: '2', flightNumber: 'VB-201', status: 'Delayed', destination: 'Monterrey (MTY)', gate: 'A04', time: '14:45', passengerCount: 189 },
  { id: '3', flightNumber: 'Y4-882', status: 'Boarding', destination: 'Tijuana (TIJ)', gate: 'C01', time: '15:00', passengerCount: 165 },
  { id: '4', flightNumber: 'DL-120', status: 'On Time', destination: 'Atlanta (ATL)', gate: 'B08', time: '15:15', passengerCount: 210 },
  { id: '5', flightNumber: 'AM-500', status: 'Cancelled', destination: 'Guadalajara (GDL)', gate: '-', time: '15:30', passengerCount: 0 },
  { id: '6', flightNumber: 'UA-773', status: 'Arrived', destination: 'Houston (IAH)', gate: 'B10', time: '14:10', passengerCount: 150 },
];

const CHART_DATA = [
  { name: '06:00', passengers: 400, flights: 5 },
  { name: '09:00', passengers: 1200, flights: 12 },
  { name: '12:00', passengers: 1800, flights: 18 },
  { name: '15:00', passengers: 2400, flights: 22 },
  { name: '18:00', passengers: 1600, flights: 15 },
  { name: '21:00', passengers: 800, flights: 8 },
];

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const handleAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiThinking(true);
    setAiResponse(''); // Clear previous

    const context = `
      Total de Vuelos Listados: ${FLIGHT_DATA.length}.
      Vuelos Demorados: ${FLIGHT_DATA.filter(f => f.status === 'Delayed').length}.
      Hora Pico Actual: 15:00.
      Vuelos Recientes: ${FLIGHT_DATA.map(f => `${f.flightNumber} a ${f.destination} está ${f.status}`).join(', ')}.
    `;

    const response = await generateOperationalInsight(context, aiQuery);
    setAiResponse(response);
    setIsAiThinking(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-20">
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
           <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Aeropuerto_Internacional_Felipe_%C3%81ngeles_Logo.svg/1024px-Aeropuerto_Internacional_Felipe_%C3%81ngeles_Logo.svg.png" 
                alt="AIFA Logo" 
                className="h-10 object-contain mr-3"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 leading-tight">AIFA</span>
            <span className="text-xs font-bold text-[#B38E5D] tracking-wider">CONTRATOS</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Resumen' },
            { id: 'contracts', icon: FileText, label: 'Contratos' },
            { id: 'flights', icon: Plane, label: 'Operaciones' },
            { id: 'personnel', icon: Users, label: 'Personal' },
            { id: 'security', icon: Shield, label: 'Seguridad' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-slate-100 text-[#B38E5D]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`h-5 w-5 mr-3 ${activeTab === item.id ? 'text-[#B38E5D]' : 'text-slate-400'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center p-3 bg-slate-50 rounded-lg mb-3">
            <div className="h-10 w-10 rounded-full bg-[#B38E5D]/10 flex items-center justify-center text-[#B38E5D] font-bold border border-[#B38E5D]/20">
              {user.name.charAt(0)}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-slate-700 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">Administrador</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-y-auto">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
          <div className="flex items-center md:hidden">
            <span className="font-bold text-slate-800">AIFA</span>
          </div>

          <div className="hidden md:flex items-center max-w-md w-full bg-slate-100 rounded-lg px-3 py-2 border border-slate-200 focus-within:border-[#B38E5D] focus-within:ring-1 focus-within:ring-[#B38E5D] transition-all">
            <Search className="h-4 w-4 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Buscar contratos, vuelos, personal..." 
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-4">
             <button 
              onClick={() => setIsAiChatOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-all border border-slate-700"
            >
              <Sparkles className="h-4 w-4 text-[#B38E5D]" />
              <span className="hidden sm:inline">Asistente AI</span>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-8 space-y-8">
          
          {/* Welcome Section */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Panel de Control</h1>
            <p className="text-slate-500 mt-1">Monitoreo en tiempo real de operaciones y contratos del AIFA.</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Contratos Activos', value: '142', trend: '+12%', icon: Briefcase, color: 'blue' },
              { label: 'Pasajeros Hoy', value: '18,420', trend: '+5%', icon: Users, color: 'green' },
              { label: 'Puntualidad', value: '94.2%', trend: '-1.5%', icon: Clock, color: 'orange' },
              { label: 'Alertas Operativas', value: '3', trend: '0%', icon: AlertCircle, color: 'red' },
            ].map((kpi, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{kpi.value}</h3>
                  </div>
                  <div className={`p-2 rounded-lg bg-${kpi.color}-50`}>
                    <kpi.icon className={`h-5 w-5 text-${kpi.color}-600`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs">
                  <span className={`font-medium ${kpi.trend.startsWith('+') ? 'text-green-600' : kpi.trend === '0%' ? 'text-slate-500' : 'text-red-600'}`}>
                    {kpi.trend}
                  </span>
                  <span className="text-slate-400 ml-1">vs última hora</span>
                </div>
              </div>
            ))}
          </div>

          {/* Main Charts & Tables Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Charts */}
            <div className="lg:col-span-2 space-y-8">
              {/* Traffic Chart */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Tráfico de Pasajeros y Vuelos</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{fill: '#f1f5f9'}}
                      />
                      <Bar dataKey="passengers" fill="#B38E5D" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Flight Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800">Operaciones Recientes</h3>
                  <button className="text-sm text-[#B38E5D] font-medium hover:text-[#9c7b50]">Ver Todo</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                      <tr>
                        <th className="px-6 py-3">Vuelo</th>
                        <th className="px-6 py-3">Estado</th>
                        <th className="px-6 py-3">Destino</th>
                        <th className="px-6 py-3">Puerta</th>
                        <th className="px-6 py-3">Hora</th>
                        <th className="px-6 py-3 text-right">Pax</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {FLIGHT_DATA.map((flight) => (
                        <tr key={flight.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-800">{flight.flightNumber}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                              ${flight.status === 'On Time' ? 'bg-green-50 text-green-700 border-green-200' : 
                                flight.status === 'Delayed' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                flight.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                flight.status === 'Boarding' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-slate-100 text-slate-800 border-slate-200'
                              }`}>
                              {flight.status === 'On Time' ? 'A Tiempo' :
                               flight.status === 'Delayed' ? 'Demorado' :
                               flight.status === 'Boarding' ? 'Abordando' :
                               flight.status === 'Cancelled' ? 'Cancelado' :
                               flight.status === 'Arrived' ? 'Aterrizado' : flight.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{flight.destination}</td>
                          <td className="px-6 py-4 text-slate-600">{flight.gate}</td>
                          <td className="px-6 py-4 text-slate-600 font-mono">{flight.time}</td>
                          <td className="px-6 py-4 text-right text-slate-600">{flight.passengerCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Col: Status & Map Placeholder */}
            <div className="space-y-8">
              {/* Status Cards */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Estado de Terminal</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Terminal 1', status: 'Operativo', color: 'green' },
                    { name: 'Pista 04L', status: 'Mantenimiento', color: 'orange' },
                    { name: 'Sistema de Equipaje', status: 'Operativo', color: 'green' },
                    { name: 'Aduana', status: 'Tráfico Alto', color: 'red' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="font-medium text-slate-700">{item.name}</span>
                      <div className="flex items-center">
                        <div className={`h-2.5 w-2.5 rounded-full bg-${item.color}-500 mr-2 animate-pulse`}></div>
                        <span className={`text-xs font-medium text-${item.color}-600`}>{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Map Placeholder */}
              <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg relative h-64 group border border-slate-700">
                 <img 
                  src="https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=2070&auto=format&fit=crop" 
                  alt="Map" 
                  className="w-full h-full object-cover opacity-60 transition-opacity group-hover:opacity-40"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <MapPin className="h-8 w-8 mb-2 text-[#B38E5D]" />
                  <span className="font-medium tracking-wide">Vista Satelital en Vivo</span>
                  <button className="mt-4 px-4 py-2 bg-[#B38E5D] rounded-lg text-xs font-bold hover:bg-[#9c7b50] transition-colors text-white shadow-md">
                    ABRIR MAPA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Chat Assistant Modal/Slide-over */}
      {isAiChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end pointer-events-none">
          <div className="absolute inset-0 bg-black/20 pointer-events-auto backdrop-blur-sm" onClick={() => setIsAiChatOpen(false)}></div>
          <div className="w-full sm:w-96 bg-white h-[80vh] sm:h-[calc(100vh-2rem)] sm:mr-4 shadow-2xl rounded-t-2xl sm:rounded-2xl flex flex-col pointer-events-auto transform transition-transform duration-300 border border-slate-200">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 rounded-t-2xl text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#B38E5D]" />
                <div>
                  <h3 className="font-bold text-sm">Asistente Operativo</h3>
                  <p className="text-xs text-slate-400">IA Potenciada por Gemini 2.5</p>
                </div>
              </div>
              <button onClick={() => setIsAiChatOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-slate-600" />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-700">
                  Hola. Estoy analizando los datos de contratos y vuelos en tiempo real. ¿En qué puedo apoyarte hoy?
                </div>
              </div>

              {aiResponse && (
                 <div className="flex gap-3 animate-fade-in">
                   <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                     <Sparkles className="h-4 w-4 text-slate-600" />
                   </div>
                   <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-700">
                     {aiResponse}
                   </div>
                 </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100 rounded-b-2xl">
              <form onSubmit={handleAiQuery} className="relative">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Preguntar sobre demoras..."
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#B38E5D] focus:border-[#B38E5D] outline-none transition-all"
                />
                <button 
                  type="submit" 
                  disabled={isAiThinking || !aiQuery.trim()}
                  className="absolute right-2 top-2 p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors"
                >
                  {isAiThinking ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
              <p className="text-xs text-center text-slate-400 mt-2">La IA puede cometer errores. Verificar datos en sistema.</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;