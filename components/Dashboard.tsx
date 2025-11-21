import React, { useState, useEffect } from 'react';
import { 
  Plane, LayoutDashboard, Users, Bell, Search, 
  LogOut, Clock, MapPin, AlertCircle,
  Sparkles, X, Send, FileText, Briefcase, Shield,
  DollarSign, Calendar, Store, PieChart as PieChartIcon,
  TrendingUp, BarChart2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { OperationData, User, Contract, CommercialSpace, PaasItem } from '../types';
import { generateOperationalInsight } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';

// === IMÁGENES ===
const LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Aeropuerto_Internacional_Felipe_%C3%81ngeles_Logo.svg/1024px-Aeropuerto_Internacional_Felipe_%C3%81ngeles_Logo.svg.png";

// === DATOS MOCK DE RESPALDO (FALLBACK) ===
// Se usan si las tablas no existen en Supabase para mantener el Dashboard funcional y bonito.
const MOCK_CONTRACTS: Contract[] = [
  { id: 'm1', provider_name: 'Limpieza Integral S.A.', service_concept: 'Limpieza Terminal Pasajeros', contract_number: 'C-2024-001', start_date: '2024-01-01', end_date: '2024-12-31', amount_mxn: 12500000, status: 'ACTIVO', area: 'Terminal 1' },
  { id: 'm2', provider_name: 'Seguridad Privada Elite', service_concept: 'Vigilancia de Filtros', contract_number: 'C-2024-045', start_date: '2023-06-01', end_date: '2024-06-01', amount_mxn: 8400000, status: 'POR VENCER', area: 'Accesos' },
  { id: 'm3', provider_name: 'Mantenimiento Pistas MX', service_concept: 'Mantenimiento Pista Central', contract_number: 'C-2023-889', start_date: '2023-01-01', end_date: '2023-12-31', amount_mxn: 45000000, status: 'VENCIDO', area: 'Pistas' },
  { id: 'm4', provider_name: 'Tecnología Aeroportuaria', service_concept: 'Soporte FIDS', contract_number: 'C-2024-102', start_date: '2024-02-15', end_date: '2025-02-15', amount_mxn: 3200000, status: 'ACTIVO', area: 'Sistemas' },
];

const MOCK_SPACES: CommercialSpace[] = [
  { id: 's1', space_code: 'LOC-001', tenant_name: 'Starbucks Coffee', category: 'Alimentos', monthly_rent: 85000, occupancy_status: 'OCUPADO' },
  { id: 's2', space_code: 'LOC-002', tenant_name: 'Farmacias del Ahorro', category: 'Servicios', monthly_rent: 45000, occupancy_status: 'OCUPADO' },
  { id: 's3', space_code: 'LOC-003', tenant_name: 'Duty Free Americas', category: 'Retail', monthly_rent: 120000, occupancy_status: 'OCUPADO' },
  { id: 's4', space_code: 'LOC-004', tenant_name: null, category: 'Retail', monthly_rent: 40000, occupancy_status: 'DISPONIBLE' },
  { id: 's5', space_code: 'LOC-005', tenant_name: 'Krispy Kreme', category: 'Alimentos', monthly_rent: 55000, occupancy_status: 'OCUPADO' },
];

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

// Datos de Vuelos (Mock para Operaciones en tiempo real)
const FLIGHT_DATA: OperationData[] = [
  { id: '1', flightNumber: 'AM-492', status: 'On Time', destination: 'Cancún (CUN)', gate: 'B12', time: '14:30', passengerCount: 142 },
  { id: '2', flightNumber: 'VB-201', status: 'Delayed', destination: 'Monterrey (MTY)', gate: 'A04', time: '14:45', passengerCount: 189 },
  { id: '3', flightNumber: 'Y4-882', status: 'Boarding', destination: 'Tijuana (TIJ)', gate: 'C01', time: '15:00', passengerCount: 165 },
  { id: '4', flightNumber: 'DL-120', status: 'On Time', destination: 'Atlanta (ATL)', gate: 'B08', time: '15:15', passengerCount: 210 },
  { id: '5', flightNumber: 'AM-500', status: 'Cancelled', destination: 'Guadalajara (GDL)', gate: '-', time: '15:30', passengerCount: 0 },
  { id: '6', flightNumber: 'UA-773', status: 'Arrived', destination: 'Houston (IAH)', gate: 'B10', time: '14:10', passengerCount: 150 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#B38E5D', '#8884d8'];

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeContractSubTab, setActiveContractSubTab] = useState<'general' | 'paas'>('general'); // Sub-tab state
  
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Database State
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [commercialSpaces, setCommercialSpaces] = useState<CommercialSpace[]>([]);
  const [paasData, setPaasData] = useState<PaasItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch Data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        
        // 1. Fetch Contracts
        const { data: contractsData, error: contractsError } = await supabase
          .from('contracts')
          .select('*')
          .order('end_date', { ascending: true });
        
        if (contractsData) {
          setContracts(contractsData);
        } else {
          // Fallback silencioso a Mock Data si la tabla no existe
          console.warn("Tabla 'contracts' no encontrada o vacía. Usando datos de demostración.");
          setContracts(MOCK_CONTRACTS);
        }

        // 2. Fetch Commercial Spaces
        const { data: spacesData, error: spacesError } = await supabase
          .from('commercial_spaces')
          .select('*');

        if (spacesData) {
           setCommercialSpaces(spacesData);
        } else {
           console.warn("Tabla 'commercial_spaces' no encontrada o vacía. Usando datos de demostración.");
           setCommercialSpaces(MOCK_SPACES);
        }

        // 3. Fetch PAAS Data (Leyendo la tabla exacta que creó el usuario)
        const { data: paasResults, error: paasError } = await supabase
          .from('balance_paas_2026')
          .select('*');
        
        if (paasResults) {
           setPaasData(paasResults);
        }
        
        if (paasError) {
           console.error("Error fetching PAAS:", paasError.message);
        }

      } catch (e) {
        console.error("Exception fetching data", e);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiThinking(true);
    setAiResponse(''); 

    // Totales basados en las columnas nuevas
    const totalSolicitadoPaas = paasData.reduce((acc, curr) => acc + (curr["Monto solicitado anteproyecto 2026"] || 0), 0);
    const totalModificadoPaas = paasData.reduce((acc, curr) => acc + (curr["Modificado"] || 0), 0);

    const context = `
      Resumen de Base de Datos AIFA:
      - Contratos Activos: ${contracts.filter(c => c.status === 'ACTIVO').length}
      - Presupuesto PAAS 2026 Solicitado Total: $${totalSolicitadoPaas.toLocaleString()} MXN
      - Presupuesto PAAS 2026 Modificado: $${totalModificadoPaas.toLocaleString()} MXN
      - Número de Partidas en PAAS: ${paasData.length}
      - Locales Comerciales Ocupados: ${commercialSpaces.filter(s => s.occupancy_status === 'OCUPADO').length}
    `;

    const response = await generateOperationalInsight(context, aiQuery);
    setAiResponse(response);
    setIsAiThinking(false);
  };

  // Calculos para Gráficas Generales
  const contractStatusData = [
    { name: 'Activos', value: contracts.filter(c => c.status === 'ACTIVO').length },
    { name: 'Por Vencer', value: contracts.filter(c => c.status === 'POR VENCER').length },
    { name: 'Vencidos', value: contracts.filter(c => c.status === 'VENCIDO').length },
  ];

  // === LÓGICA NUEVA PARA TU TABLA PAAS ===
  // Agrupar datos por "Gerencia" para graficar el presupuesto
  const paasByGerencia = paasData.reduce((acc: any[], item) => {
    const gerenciaName = item["Gerencia"] || 'Sin Asignar';
    const monto = item["Monto solicitado anteproyecto 2026"] || 0;
    
    const existing = acc.find(x => x.name === gerenciaName);
    if (existing) {
      existing.value += monto;
    } else {
      acc.push({
        name: gerenciaName,
        value: monto
      });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value); // Ordenar de mayor a menor gasto

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '$0.00';
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(val);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-20">
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
           <img 
                src={LOGO_URL}
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
            { id: 'contracts', icon: FileText, label: 'Gestión Contratos' },
            { id: 'commercial', icon: Store, label: 'Área Comercial' },
            { id: 'flights', icon: Plane, label: 'Operaciones Aéreas' },
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
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-slate-700 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
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
        
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
          <div className="flex items-center md:hidden">
            <img src={LOGO_URL} alt="AIFA" className="h-8 mr-2" />
            <span className="font-bold text-slate-800">AIFA CONTRATOS</span>
          </div>

          <div className="hidden md:flex items-center max-w-md w-full bg-slate-100 rounded-lg px-3 py-2 border border-slate-200 focus-within:border-[#B38E5D] focus-within:ring-1 focus-within:ring-[#B38E5D] transition-all">
            <Search className="h-4 w-4 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-4">
             <button 
              onClick={() => setIsAiChatOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-full shadow hover:bg-slate-800 transition-all"
            >
              <Sparkles className="h-4 w-4 text-[#B38E5D]" />
              <span className="hidden sm:inline">Asistente IA</span>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-8 space-y-8">
          
          {/* === CONTENIDO DINÁMICO SEGÚN TAB === */}
          
          {activeTab === 'overview' && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Resumen Ejecutivo</h1>
                <p className="text-slate-500 mt-1">Panorama general de contratos y operaciones.</p>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Contratos Activos', value: contracts.filter(c => c.status === 'ACTIVO').length.toString(), trend: '+2', icon: Briefcase, color: 'blue' },
                  { label: 'Monto PAAS 2026', value: '$' + (paasData.reduce((acc, c) => acc + (c["Monto solicitado anteproyecto 2026"] || 0), 0) / 1000000).toFixed(1) + 'M', trend: 'Anteproyecto', icon: DollarSign, color: 'green' },
                  { label: 'Partidas PAAS', value: paasData.length.toString(), trend: 'Total', icon: FileText, color: 'orange' },
                  { label: 'Locales Ocupados', value: commercialSpaces.filter(s => s.occupancy_status === 'OCUPADO').length.toString(), trend: '95%', icon: Store, color: 'purple' },
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
                    <div className="mt-2 text-xs text-slate-400">
                        <span className="font-medium text-slate-600">{kpi.trend}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Estatus de Contratos Vigentes</h3>
                    <div className="h-64 w-full flex items-center justify-center">
                        {loadingData ? <p>Cargando...</p> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={contractStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {contractStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : index === 1 ? '#f59e0b' : '#ef4444'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800">Top Partidas (Mayor Monto)</h3>
                    </div>
                    <div className="overflow-y-auto max-h-80">
                        {loadingData ? <div className="p-4">Cargando...</div> : (
                            <div className="divide-y divide-slate-100">
                                {[...paasData]
                                   .sort((a, b) => (b["Monto solicitado anteproyecto 2026"] || 0) - (a["Monto solicitado anteproyecto 2026"] || 0))
                                   .slice(0, 5)
                                   .map((item, idx) => (
                                    <div key={idx} className="p-4 hover:bg-slate-50">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-sm text-slate-800 truncate w-2/3">{item["Nombre del Servicio."]}</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                                                {formatCurrency(item["Monto solicitado anteproyecto 2026"])}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">{item["Gerencia"]}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'contracts' && (
            <div>
               <div className="flex justify-between items-center mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestión de Contratos</h1>
                    <p className="text-slate-500 text-sm">Administración de servicios, proveedores y presupuestos PAAS.</p>
                  </div>
                  <button className="bg-[#B38E5D] hover:bg-[#9c7a4d] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
                    + Nuevo Registro
                  </button>
               </div>

               {/* Sub-Tabs Navigation */}
               <div className="flex border-b border-slate-200 mb-6">
                  <button 
                    onClick={() => setActiveContractSubTab('general')}
                    className={`px-6 py-3 text-sm font-medium transition-all border-b-2 ${activeContractSubTab === 'general' ? 'border-[#B38E5D] text-[#B38E5D]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    Listado General
                  </button>
                  <button 
                     onClick={() => setActiveContractSubTab('paas')}
                     className={`px-6 py-3 text-sm font-medium transition-all border-b-2 ${activeContractSubTab === 'paas' ? 'border-[#B38E5D] text-[#B38E5D]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Balance PAAS 2026
                    </div>
                  </button>
               </div>
               
               {/* === CONTRACTS: GENERAL LIST === */}
               {activeContractSubTab === 'general' && (
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-4 font-semibold">Proveedor</th>
                            <th className="px-6 py-4 font-semibold">Concepto</th>
                            <th className="px-6 py-4 font-semibold">Monto (MXN)</th>
                            <th className="px-6 py-4 font-semibold">Vigencia</th>
                            <th className="px-6 py-4 font-semibold">Área</th>
                            <th className="px-6 py-4 font-semibold">Estatus</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {loadingData ? (
                            <tr><td colSpan={6} className="text-center py-8">Cargando datos...</td></tr>
                          ) : contracts.map((contract) => (
                            <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-slate-900">{contract.provider_name}<br/><span className="text-xs text-slate-400 font-normal">{contract.contract_number}</span></td>
                              <td className="px-6 py-4 text-slate-600">{contract.service_concept}</td>
                              <td className="px-6 py-4 font-mono text-slate-700">{formatCurrency(contract.amount_mxn || 0)}</td>
                              <td className="px-6 py-4 text-slate-500">
                                  <div className="flex items-center gap-1"><Calendar className="h-3 w-3"/> {contract.end_date}</div>
                              </td>
                              <td className="px-6 py-4 text-slate-600">{contract.area}</td>
                              <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${contract.status === 'ACTIVO' ? 'bg-green-100 text-green-800' : 
                                      contract.status === 'POR VENCER' ? 'bg-orange-100 text-orange-800' :
                                      'bg-red-100 text-red-800'}`}>
                                    {contract.status}
                                  </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                 </div>
               )}

               {/* === CONTRACTS: PAAS 2026 (ESTRUCTURA NUEVA) === */}
               {activeContractSubTab === 'paas' && (
                 <div className="animate-fade-in space-y-6">
                    {/* PAAS Stats Header */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                           <div className="absolute right-0 top-0 p-4 opacity-10"><DollarSign className="h-16 w-16 text-slate-400"/></div>
                           <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Solicitado 2026</p>
                           <h3 className="text-2xl font-bold text-slate-900 mt-1">
                             {formatCurrency(paasData.reduce((a, b) => a + (b["Monto solicitado anteproyecto 2026"] || 0), 0))}
                           </h3>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                           <div className="absolute right-0 top-0 p-4 opacity-10"><Briefcase className="h-16 w-16 text-[#B38E5D]"/></div>
                           <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Modificado</p>
                           <h3 className="text-2xl font-bold text-[#B38E5D] mt-1">
                             {formatCurrency(paasData.reduce((a, b) => a + (b["Modificado"] || 0), 0))}
                           </h3>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                           <div className="absolute right-0 top-0 p-4 opacity-10"><FileText className="h-16 w-16 text-blue-400"/></div>
                           <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Partidas Totales</p>
                           <h3 className="text-3xl font-bold text-slate-900 mt-1">
                              {paasData.length}
                           </h3>
                        </div>
                    </div>

                    {/* Graphic Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><BarChart2 className="h-5 w-5 text-slate-400"/> Presupuesto por Gerencia</h3>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={paasByGerencia} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                              <XAxis type="number" hide />
                              <YAxis type="category" dataKey="name" width={180} tick={{fontSize: 11}} />
                              <Tooltip formatter={(value: number) => formatCurrency(value)} />
                              <Bar dataKey="value" name="Monto Solicitado" fill="#B38E5D" radius={[0, 4, 4, 0]} barSize={25} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div className="bg-slate-900 rounded-xl shadow-lg p-6 text-white flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-bold mb-2">Control Presupuestal</h3>
                          <p className="text-slate-400 text-sm mb-6">Visualización basada en la tabla `balance_paas_2026`.</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                             <div className="text-xs text-slate-400">
                                Se muestran los montos solicitados para el anteproyecto 2026 desglosados por Clave Cucop y Servicio.
                             </div>
                        </div>
                      </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                       <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider">
                              <tr>
                                <th className="px-4 py-3 font-semibold w-16">No.</th>
                                <th className="px-4 py-3 font-semibold">Clave CUCOP</th>
                                <th className="px-4 py-3 font-semibold">Nombre del Servicio</th>
                                <th className="px-4 py-3 font-semibold">Gerencia</th>
                                <th className="px-4 py-3 font-semibold text-right">Monto Solicitado</th>
                                <th className="px-4 py-3 font-semibold text-right">Modificado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {loadingData ? (
                                <tr><td colSpan={6} className="text-center py-8">Cargando PAAS...</td></tr>
                              ) : paasData.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-slate-500">No hay registros en el PAAS 2026.</td></tr>
                              ) : paasData.map((item) => (
                                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 text-slate-500">{item["No."]}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{item["Clave cucop"]}</td>
                                    <td className="px-4 py-3 text-slate-800 font-medium">{item["Nombre del Servicio."]}</td>
                                    <td className="px-4 py-3 text-slate-600 text-xs">{item["Gerencia"]}</td>
                                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                                       {formatCurrency(item["Monto solicitado anteproyecto 2026"])}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-slate-500">
                                       {formatCurrency(item["Modificado"])}
                                    </td>
                                  </tr>
                              ))}
                            </tbody>
                          </table>
                       </div>
                    </div>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'commercial' && (
             <div>
               <h1 className="text-2xl font-bold text-slate-900 mb-6">Locales Comerciales</h1>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loadingData ? <p>Cargando...</p> : commercialSpaces.map(space => (
                     <div key={space.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 transform rotate-45 
                           ${space.occupancy_status === 'OCUPADO' ? 'bg-green-500' : space.occupancy_status === 'DISPONIBLE' ? 'bg-blue-500' : 'bg-gray-400'}`}>
                        </div>
                        <div className="flex items-start justify-between mb-4">
                           <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center text-2xl font-bold text-slate-400">
                              {space.tenant_name ? space.tenant_name.charAt(0) : '?'}
                           </div>
                           <span className="text-xs font-mono text-slate-400">{space.space_code}</span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-800">{space.tenant_name || 'DISPONIBLE'}</h3>
                        <p className="text-sm text-slate-500 mb-4">{space.category}</p>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                           <span className="font-bold text-slate-700">{formatCurrency(space.monthly_rent)} <span className="text-xs font-normal text-slate-400">/mes</span></span>
                           <span className={`text-xs font-bold px-2 py-1 rounded 
                              ${space.occupancy_status === 'OCUPADO' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                              {space.occupancy_status}
                           </span>
                        </div>
                     </div>
                  ))}
               </div>
             </div>
          )}

          {/* Flights Tab (Fallback to static data for now) */}
          {activeTab === 'flights' && (
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Operaciones del Día</h1>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-6 py-3">Vuelo</th>
                        <th className="px-6 py-3">Estado</th>
                        <th className="px-6 py-3">Destino</th>
                        <th className="px-6 py-3">Puerta</th>
                        <th className="px-6 py-3">Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {FLIGHT_DATA.map((flight) => (
                        <tr key={flight.id}>
                          <td className="px-6 py-4 font-medium">{flight.flightNumber}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                              ${flight.status === 'On Time' ? 'bg-green-100 text-green-700' : 
                                flight.status === 'Delayed' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100'}`}>
                              {flight.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">{flight.destination}</td>
                          <td className="px-6 py-4">{flight.gate}</td>
                          <td className="px-6 py-4">{flight.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
          )}

        </div>
      </main>

      {/* AI Chat Overlay */}
      {isAiChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end pointer-events-none">
          <div className="absolute inset-0 bg-black/20 pointer-events-auto backdrop-blur-sm" onClick={() => setIsAiChatOpen(false)}></div>
          <div className="w-full sm:w-96 bg-white h-[80vh] sm:h-[calc(100vh-2rem)] sm:mr-4 shadow-2xl rounded-t-2xl sm:rounded-2xl flex flex-col pointer-events-auto border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center rounded-t-2xl">
              <h3 className="font-bold flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#B38E5D]"/> Asistente</h3>
              <button onClick={() => setIsAiChatOpen(false)}><X className="h-5 w-5"/></button>
            </div>
            <div className="flex-1 p-4 bg-slate-50 overflow-y-auto">
              {aiResponse ? (
                <div className="bg-white p-3 rounded-lg shadow-sm text-sm">{aiResponse}</div>
              ) : (
                <p className="text-center text-slate-400 text-sm mt-10">
                   Soy tu analista de contratos inteligente.<br/>
                   Pregúntame: "¿Qué contratos vencen este mes?" o "¿Cuál es la ocupación comercial actual?"
                </p>
              )}
            </div>
            <div className="p-4 bg-white border-t">
              <form onSubmit={handleAiQuery} className="flex gap-2">
                <input 
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  placeholder="Escribe tu consulta..."
                  className="flex-1 bg-slate-100 border-none rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-[#B38E5D] outline-none"
                />
                <button 
                  type="submit" 
                  disabled={isAiThinking}
                  className="bg-[#B38E5D] text-white p-2 rounded-lg hover:bg-[#9c7a4d] disabled:opacity-50"
                >
                  {isAiThinking ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;