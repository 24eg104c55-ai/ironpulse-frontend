import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Plans from './pages/Plans';
import Payments from './pages/Payments';
import Attendance from './pages/Attendance';
import MyProfile from './pages/MyProfile';

function MainApp() {
  const { user, isAdmin } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [activePage, setActivePage] = useState(() => (user?.role === 'ADMIN' ? 'dashboard' : 'my-profile'));

  // If user is not logged in, show Login or Register screens
  if (!user) {
    if (authView === 'register') {
      return <Register onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <Login onSwitchToRegister={() => setAuthView('register')} />;
  }

  // Render current selected page
  const renderCurrentPage = () => {
    switch (activePage) {
      case 'dashboard':
        return isAdmin ? <Dashboard setActivePage={setActivePage} /> : <MyProfile setActivePage={setActivePage} />;
      case 'members':
        return isAdmin ? <Members /> : <MyProfile setActivePage={setActivePage} />;
      case 'plans':
        return <Plans />;
      case 'payments':
        return <Payments />;
      case 'attendance':
        return <Attendance />;
      case 'my-profile':
        return <MyProfile setActivePage={setActivePage} />;
      default:
        return isAdmin ? <Dashboard setActivePage={setActivePage} /> : <MyProfile setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="main-content">
        <Navbar activePage={activePage} />
        <main className="content-body">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
