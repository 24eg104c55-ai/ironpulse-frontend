import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Dashboard({ setActivePage }) {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMemberships: 0,
    expiredMemberships: 0,
    totalRevenue: 0,
    todayCheckIns: 0,
  });
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsData, attendanceData] = await Promise.all([
        api.dashboard.getStats(),
        api.attendance.getToday(),
      ]);
      setStats(statsData);
      setTodayAttendance(attendanceData || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Top Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-primary">👥</div>
          <div>
            <div className="stat-value">{stats.totalMembers}</div>
            <div className="stat-label">Total Members</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-success">⚡</div>
          <div>
            <div className="stat-value">{stats.activeMemberships}</div>
            <div className="stat-label">Active Memberships</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-danger">⚠️</div>
          <div>
            <div className="stat-value">{stats.expiredMemberships}</div>
            <div className="stat-label">Expired Plans</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-primary">💵</div>
          <div>
            <div className="stat-value">
              ${Number(stats.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-warning">⏱️</div>
          <div>
            <div className="stat-value">{stats.todayCheckIns}</div>
            <div className="stat-label">Today's Check-ins</div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 className="card-title">Quick Administration Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setActivePage('members')}>
            ➕ Manage Members
          </button>
          <button className="btn btn-secondary" onClick={() => setActivePage('plans')}>
            💳 Membership Plans
          </button>
          <button className="btn btn-secondary" onClick={() => setActivePage('payments')}>
            💵 Record Payment
          </button>
          <button className="btn btn-outline" onClick={() => setActivePage('attendance')}>
            ⏱️ Log Member Attendance
          </button>
          <button className="btn btn-outline" onClick={loadData} style={{ marginLeft: 'auto' }}>
            🔄 Refresh Metrics
          </button>
        </div>
      </div>

      {/* Today's Gym Check-ins Preview */}
      <div className="card">
        <div className="card-title">
          <span>Today's Live Gym Check-ins ({todayAttendance.length})</span>
          <button className="btn btn-outline btn-sm" onClick={() => setActivePage('attendance')}>
            View All Attendance &rarr;
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading today's attendance logs...</p>
        ) : todayAttendance.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏋️‍♂️</div>
            <p className="empty-state-text">No check-ins recorded yet today.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Email</th>
                  <th>Check-In Time</th>
                  <th>Check-Out Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAttendance.slice(0, 5).map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 600 }}>{log.user?.name}</td>
                    <td>{log.user?.email}</td>
                    <td>{log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td>{log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Still In Gym'}</td>
                    <td>
                      <span className={`badge ${log.status === 'COMPLETED' ? 'badge-completed' : 'badge-checked_in'}`}>
                        {log.status === 'COMPLETED' ? 'Checked Out' : 'Active In Gym'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
