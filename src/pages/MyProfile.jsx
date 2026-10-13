import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function MyProfile({ setActivePage }) {
  const { user, refreshUser } = useAuth();
  const [latestMembership, setLatestMembership] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      await refreshUser();
      const [membershipData, attendanceData, paymentsData] = await Promise.all([
        api.memberships.getLatestByUser(user.id),
        api.attendance.getByUser(user.id),
        api.payments.getByUser(user.id),
      ]);
      setLatestMembership(membershipData);
      setAttendanceLogs(attendanceData || []);
      setRecentPayments(paymentsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  // Check if member is checked in today
  const todayStr = new Date().toISOString().split('T')[0];
  const isCheckedInToday = attendanceLogs.some(
    (a) => a.date === todayStr && a.status === 'CHECKED_IN'
  );

  const handleCheckIn = async () => {
    try {
      await api.attendance.checkIn(user.id);
      setFeedback({ type: 'success', message: 'Checked in successfully! Have a great workout.' });
      loadData();
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Check-in failed.' });
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.attendance.checkOut(user.id);
      setFeedback({ type: 'success', message: 'Checked out successfully! See you next time.' });
      loadData();
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Check-out failed.' });
    }
  };

  // Calculate days remaining
  const calculateDaysRemaining = (endDateStr) => {
    if (!endDateStr) return null;
    const end = new Date(endDateStr);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = latestMembership?.endDate
    ? calculateDaysRemaining(latestMembership.endDate)
    : null;

  return (
    <div>
      {feedback.message && (
        <div className={`alert alert-${feedback.type}`}>
          {feedback.message}
          <button
            onClick={() => setFeedback({ type: '', message: '' })}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Membership Hero Card */}
      <div className="membership-status-card">
        <div>
          <span className="badge badge-admin" style={{ marginBottom: '0.75rem', background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            Current Membership Plan
          </span>
          <h2 className="membership-plan-headline">
            {latestMembership?.plan?.name || user?.currentPlanName || 'No Active Membership'}
          </h2>

          <p style={{ opacity: 0.9, maxWidth: '500px' }}>
            {latestMembership?.plan?.description || 'Get unlimited access to equipment, locker rooms, and gym services.'}
          </p>

          <div className="membership-dates-info">
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.7 }}>Valid From</div>
              <div style={{ fontWeight: 600 }}>{latestMembership?.startDate || '-'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.7 }}>Valid Until</div>
              <div style={{ fontWeight: 600 }}>{latestMembership?.endDate || '-'}</div>
            </div>
            {daysRemaining !== null && (
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.7 }}>Validity</div>
                <div style={{ fontWeight: 600 }}>
                  {daysRemaining > 0 ? `${daysRemaining} Days Left` : 'Expired'}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '180px' }}>
          <button
            className="btn btn-success btn-lg"
            onClick={isCheckedInToday ? handleCheckOut : handleCheckIn}
          >
            {isCheckedInToday ? '🔴 Check Out of Gym' : '🟢 Check In to Gym'}
          </button>

          <button
            className="btn btn-outline"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
            onClick={() => setActivePage('plans')}
          >
            Explore All Plans &rarr;
          </button>
        </div>
      </div>

      {/* Account Info and Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Account Details */}
        <div className="card">
          <h3 className="card-title">Member Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.925rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Full Name: </span>
              <strong>{user?.name}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Registered Email: </span>
              <strong>{user?.email}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Phone Number: </span>
              <strong>{user?.phone || 'Not provided'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Account ID: </span>
              <strong>#{user?.id}</strong>
            </div>
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="card">
          <div className="card-title">
            <span>Recent Gym Visits</span>
            <button className="btn btn-outline btn-sm" onClick={() => setActivePage('attendance')}>
              View All
            </button>
          </div>
          {attendanceLogs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No attendance visits yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {attendanceLogs.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid var(--border)',
                    fontSize: '0.875rem',
                  }}
                >
                  <span>📅 {a.date}</span>
                  <span style={{ fontWeight: 600 }}>
                    {a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                  <span className={`badge ${a.status === 'COMPLETED' ? 'badge-completed' : 'badge-checked_in'}`}>
                    {a.status === 'COMPLETED' ? 'Done' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
