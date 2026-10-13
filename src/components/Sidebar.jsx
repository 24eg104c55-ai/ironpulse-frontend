import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activePage, setActivePage }) {
  const { user, isAdmin, logout } = useAuth();

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'members', label: 'Members', icon: '👥' },
    { id: 'plans', label: 'Membership Plans', icon: '💳' },
    { id: 'payments', label: 'Payments', icon: '💵' },
    { id: 'attendance', label: 'Attendance', icon: '⏱️' },
  ];

  const memberNavItems = [
    { id: 'my-profile', label: 'My Membership', icon: '🏋️‍♂️' },
    { id: 'plans', label: 'Gym Plans', icon: '💳' },
    { id: 'payments', label: 'My Payments', icon: '💵' },
    { id: 'attendance', label: 'My Attendance', icon: '⏱️' },
  ];

  const items = isAdmin ? adminNavItems : memberNavItems;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">⚡</div>
        <div className="brand-name">IronPulse</div>
        <span className="brand-badge">{isAdmin ? 'Admin' : 'Member'}</span>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`nav-link ${activePage === item.id ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-snippet">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info-text">
            <div className="user-info-name">{user?.name || 'User'}</div>
            <div className="user-info-role">{user?.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
