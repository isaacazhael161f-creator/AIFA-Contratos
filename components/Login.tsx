import React, { useState } from 'react';
import { ArrowRight, User, Lock, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay for realism
    setTimeout(() => {
      if (email && password) {
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setError('Credenciales inválidas. Intente nuevamente.');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 md:p-0 font-sans">
      <div className="flex w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden h-[700px]">
        
        {/* Left Side - Visual & Branding */}
        <div className="hidden md:flex w-1/2 bg-slate-900 relative flex-col justify-between p-12 text-white">
          {/* Background Image - Aerial View */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1474302770737-173ee21bab63?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center"></div>
          {/* Gradient Overlay for text readability */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90"></div>
          
          {/* Content over image */}
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
                  <span>Conexión Segura SEDENA</span>
                </div>
                <div className="h-1 w-1 bg-slate-600 rounded-full"></div>
                <div>v2.4.0</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 bg-white p-12 xl:p-16 flex flex-col justify-center relative">
          
          <div className="max-w-md mx-auto w-full">
            {/* Mobile Logo Display */}
            <div className="flex justify-center mb-10">
               <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Aeropuerto_Internacional_Felipe_%C3%81ngeles_Logo.svg/1024px-Aeropuerto_Internacional_Felipe_%C3%81ngeles_Logo.svg.png" 
                alt="AIFA Logo" 
                className="h-24 md:h-32 object-contain"
              />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Iniciar Sesión</h2>
              <p className="text-slate-500 mt-2">Ingrese sus credenciales institucionales</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-[#B38E5D] transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#B38E5D]/50 focus:border-[#B38E5D] transition-all outline-none bg-slate-50 focus:bg-white"
                    placeholder="usuario@aifa.gob.mx"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#B38E5D] transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#B38E5D]/50 focus:border-[#B38E5D] transition-all outline-none bg-slate-50 focus:bg-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-2">
                <label className="flex items-center text-slate-600 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 text-[#B38E5D] border-slate-300 rounded focus:ring-[#B38E5D]" />
                  <span className="ml-2">Recordarme</span>
                </label>
                <a href="#" className="text-[#B38E5D] hover:text-[#9c7b50] font-medium hover:underline">¿Olvidó su contraseña?</a>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex items-center justify-center animate-pulse">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 font-bold tracking-wide transition-all shadow-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    ACCEDER AL SISTEMA <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 text-center space-y-2">
              <p className="text-xs text-slate-400 uppercase tracking-widest">
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