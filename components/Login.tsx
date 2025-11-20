import React, { useState } from 'react';
import { ArrowRight, User, Lock, ShieldCheck, Mail, UserPlus, AlertTriangle, CheckCircle, Key, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showApiKeyHelp, setShowApiKeyHelp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    setShowApiKeyHelp(false);

    try {
      if (isRegistering) {
        // === REGISTRO ===
        // Obtenemos la URL actual para redirigir al usuario correctamente tras confirmar
        const currentUrl = window.location.origin;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: currentUrl, // CORRECCIÓN: Fuerza el uso de la URL actual, no localhost
            data: {
              full_name: fullName,
              role: 'OPERATOR'
            }
          }
        });

        if (error) throw error;
        
        if (data.user && !data.session) {
          setSuccessMessage('¡Cuenta creada! Revise su correo para confirmar el acceso.');
          setIsRegistering(false); // Cambiar a pantalla de login
        } else if (data.session) {
          onLoginSuccess();
        }
      } else {
        // === LOGIN ===
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        if (data.session) {
          onLoginSuccess();
        }
      }
    } catch (err: any) {
      console.error("Auth error full object:", err);
      
      const msg = err.message || '';
      const msgLower = msg.toLowerCase();

      // Detección inteligente de errores
      if (msgLower.includes("invalid api key") || msgLower.includes("jwt") || msgLower.includes("signature")) {
        setError("Error de Configuración: API Key inválida en el código.");
        setShowApiKeyHelp(true);
      } else if (msgLower.includes("forbidden") || err.code === '403') {
        setError("Acceso Denegado: Verifique sus credenciales de Supabase.");
      } else if (msgLower.includes("invalid login credentials")) {
        setError("Credenciales incorrectas. Si se registró recientemente, verifique que haya confirmado su correo electrónico.");
      } else if (msgLower.includes("email not confirmed")) {
        setError("Correo no confirmado. Revise su bandeja de entrada (o spam).");
      } else if (msgLower.includes("user already registered")) {
        setError("Este correo ya está registrado. Intente iniciar sesión.");
      } else {
        setError(msg || 'Error de conexión. Intente nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 md:p-0 font-sans">
      <div className="flex w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden h-[750px] md:h-[700px]">
        
        {/* Left Side - Visual & Branding */}
        <div className="hidden md:flex w-1/2 bg-slate-900 relative flex-col justify-between p-12 text-white">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1474302770737-173ee21bab63?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="space-y-2">
              <h3 className="text-blue-400 font-semibold tracking-widest text-sm uppercase">Plataforma Oficial</h3>
              <h1 className="text-5xl font-bold leading-tight">
                AIFA <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">CONTRATOS</span>
              </h1>
            </div>

            <div className="space-y-6">
              <div className="backdrop-blur-md bg-white/10 p-6 rounded-2xl border border-white/10">
                <p className="text-slate-200 text-lg leading-relaxed">
                  "Sistema Integral para la gestión eficiente de recursos aeroportuarios, seguimiento de concesiones y control operativo."
                </p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-400" />
                  <span>Conexión Segura Supabase</span>
                </div>
                <div className="h-1 w-1 bg-slate-600 rounded-full"></div>
                <div>v3.1.2</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 bg-white p-8 xl:p-16 flex flex-col justify-center relative overflow-y-auto">
          
          <div className="max-w-md mx-auto w-full">
            <div className="flex justify-center mb-6">
               <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Aeropuerto_Internacional_Felipe_%C3%81ngeles_Logo.svg/1024px-Aeropuerto_Internacional_Felipe_%C3%81ngeles_Logo.svg.png" 
                alt="AIFA Logo" 
                className="h-20 md:h-24 object-contain"
              />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800">
                {isRegistering ? 'Crear Cuenta Operativa' : 'Acceso a Contratos'}
              </h2>
              <p className="text-slate-500 mt-2 text-sm">
                {isRegistering ? 'Ingrese sus datos oficiales para el registro' : 'Ingrese sus credenciales institucionales'}
              </p>
            </div>

            {showApiKeyHelp && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 animate-fade-in">
                <div className="flex items-start gap-3">
                  <Key className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900 mb-1">Se requiere configuración</h4>
                    <p className="mb-2">La API Key parece incorrecta. Verifique services/supabaseClient.ts</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5">
              
              {isRegistering && (
                <div className="animate-fade-in-up">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Nombre Completo
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400 group-focus-within:text-[#B38E5D] transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#B38E5D]/50 focus:border-[#B38E5D] transition-all outline-none bg-slate-50 focus:bg-white"
                      placeholder="Ej. Juan Pérez"
                      required={isRegistering}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-[#B38E5D] transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#B38E5D]/50 focus:border-[#B38E5D] transition-all outline-none bg-slate-50 focus:bg-white"
                    placeholder="usuario@aifa.gob.mx"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#B38E5D] transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#B38E5D]/50 focus:border-[#B38E5D] transition-all outline-none bg-slate-50 focus:bg-white"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#B38E5D] transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {!isRegistering && (
                <div className="flex items-center justify-between text-sm pt-1">
                  <label className="flex items-center text-slate-600 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 text-[#B38E5D] border-slate-300 rounded focus:ring-[#B38E5D]" />
                    <span className="ml-2">Recordarme</span>
                  </label>
                  <a href="#" className="text-[#B38E5D] hover:text-[#9c7b50] font-medium hover:underline">¿Olvidó su contraseña?</a>
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2 animate-shake">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}
              
              {successMessage && (
                <div className="text-green-700 text-sm bg-green-50 p-3 rounded-lg border border-green-200 flex items-start gap-2 animate-fade-in">
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span className="leading-snug">{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 font-bold tracking-wide transition-all shadow-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : isRegistering ? (
                  <>
                    REGISTRAR DATOS <UserPlus className="ml-2 h-5 w-5" />
                  </>
                ) : (
                  <>
                    INGRESAR AL SISTEMA <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                    setSuccessMessage('');
                    setShowApiKeyHelp(false);
                }}
                className="text-sm text-slate-600 hover:text-[#B38E5D] font-medium transition-colors underline underline-offset-4"
              >
                {isRegistering 
                  ? '¿Ya tiene cuenta? Iniciar Sesión' 
                  : '¿Nuevo usuario? Registrarse aquí'}
              </button>
            </div>

            <div className="mt-8 text-center space-y-2">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                Aeropuerto Internacional Felipe Ángeles
              </p>
              <div className="h-1 w-16 bg-gradient-to-r from-[#006341] via-white to-[#9E1B32] mx-auto rounded-full opacity-50"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;