import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { Screen, User, UserRole } from './types';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.LOGIN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        updateUserFromSession(session);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes (Login, Logout, Auto-refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        updateUserFromSession(session);
      } else {
        setCurrentUser(null);
        setCurrentScreen(Screen.LOGIN);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateUserFromSession = (session: any) => {
    const { user } = session;
    const meta = user.user_metadata;

    const appUser: User = {
      id: user.id,
      email: user.email || '',
      name: meta.full_name || user.email?.split('@')[0] || 'Usuario',
      role: (meta.role as UserRole) || UserRole.OPERATOR,
    };

    setCurrentUser(appUser);
    setCurrentScreen(Screen.DASHBOARD);
    setLoading(false);
  };

  const handleLoginSuccess = () => {
    // This is primarily redundant with onAuthStateChange, but kept for manual flow if needed
    // The state listener will handle the screen switch.
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // State listener will handle redirect
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Aeropuerto_Internacional_Felipe_%C3%81ngeles_Logo.svg/1024px-Aeropuerto_Internacional_Felipe_%C3%81ngeles_Logo.svg.png" 
            alt="Loading" 
            className="h-16 opacity-50 mb-4"
          />
          <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#B38E5D] animate-[loading_1s_ease-in-out_infinite]"></div>
          </div>
          <style>{`
            @keyframes loading {
              0% { width: 0%; margin-left: 0; }
              50% { width: 100%; margin-left: 0; }
              100% { width: 0%; margin-left: 100%; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="antialiased text-slate-900">
      {currentScreen === Screen.LOGIN && (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
      {currentScreen === Screen.DASHBOARD && currentUser && (
        <Dashboard user={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;