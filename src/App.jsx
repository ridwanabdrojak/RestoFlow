import React, { useState, useEffect } from 'react';
import { OrderProvider } from './context/OrderContext';
import Layout from './components/Layout';
import LoginScreen from './components/LoginScreen';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginTime = localStorage.getItem('loginTime');

    // Optional: session expiry (e.g., 12 hours)
    if (loggedIn && loginTime) {
      const now = new Date().getTime();
      const hours = (now - parseInt(loginTime)) / 1000 / 60 / 60;
      if (hours < 12) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loginTime');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loginTime', new Date().getTime().toString());
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginTime');
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <OrderProvider>
      <Layout onLogout={handleLogout} />
    </OrderProvider>
  );
}

export default App;
