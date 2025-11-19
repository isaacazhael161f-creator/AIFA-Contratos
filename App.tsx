import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { Screen, User, UserRole } from './types';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.LOGIN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // In a real app, we would check for a valid session token here on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('aifa_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
        setCurrentScreen(Screen.DASHBOARD);
      } catch (e) {
        localStorage.removeItem('aifa_user');
      }
    }
  }, []);

  const handleLoginSuccess = () => {
    // Mock User Data
    const mockUser: User = {
      id: 'u-123',
      name: 'Captain Isaac',
      email: 'isaac@aifa.aero',
      role: UserRole.ADMIN,
    };
    
    setCurrentUser(mockUser);
    localStorage.setItem('aifa_user', JSON.stringify(mockUser));
    setCurrentScreen(Screen.DASHBOARD);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aifa_user');
    setCurrentScreen(Screen.LOGIN);
  };

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