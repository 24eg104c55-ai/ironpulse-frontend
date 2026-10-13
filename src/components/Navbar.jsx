import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activePage }) {
  const { user, logout } = useAuth();

  const getPageTitle = (page) => {
    switch (page) {
      case 'dashboard':
        return 'Gym Overview & Metrics';
      case 'members':
        return 'Member Directory';
      case 'plans':
        return 'Membership Packages & Plans';
      case 'payments':
        return 'Payment & Billing Transactions';
      case 'attendance':
        return 'Daily Attendance & Check-in';
      case 'my-profile':
        return 'My Membership Dashboard';
      default:
        return 'Gym Management System';
    }
  };

  return (
    <header className="top-navbar">
      <h1 className="page-header-title">{getPageTitle(activePage)}</h1>

      <div className="navbar-actions">
        <span className={`badge ${user?.role === 'ADMIN' ? 'badge-admin' : 'badge-member'}`}>
          {user?.role}
        </span>
        <button onClick={logout} className="btn btn-outline btn-sm">
          Sign Out
        </button>
      </div>
    </header>
  );
}
