import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Attendance() {
  const { user, isAdmin } = useAuth();
  const [attendanceList, setAttendanceList] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        const [attData, membersData] = await Promise.all([
          api.attendance.getAll(),
          api.members.getAll(),
        ]);
        setAttendanceList(attData || []);
        setMembers(membersData || []);
        if (membersData?.length > 0 && !selectedMemberId) {
          setSelectedMemberId(membersData[0].id);
        }
      } else {
        const attData = await api.attendance.getByUser(user.id);
        setAttendanceList(attData || []);
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Failed to fetch attendance.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Check if member is currently checked in today
  const todayStr = new Date().toISOString().split('T')[0];
  const myTodayActiveCheckin = attendanceList.find(
    (a) =>
      a.date === todayStr &&
      a.status === 'CHECKED_IN' &&
      (isAdmin ? a.user?.id === Number(selectedMemberId) : true)
  );

  const handleCheckIn = async (memberIdToUse) => {
    const id = memberIdToUse || (isAdmin ? Number(selectedMemberId) : user.id);
    if (!id) {
      setFeedback({ type: 'danger', message: 'Please select a member to check in.' });
      return;
    }

    try {
      await api.attendance.checkIn(id);
      setFeedback({ type: 'success', message: 'Check-in recorded successfully!' });
      loadData();
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Check-in failed.' });
    }
  };

  const handleCheckOut = async (memberIdToUse) => {
    const id = memberIdToUse || (isAdmin ? Number(selectedMemberId) : user.id);
    if (!id) {
      setFeedback({ type: 'danger', message: 'Please select a member to check out.' });
      return;
    }

    try {
      await api.attendance.checkOut(id);
      setFeedback({ type: 'success', message: 'Check-out completed! Have a great recovery.' });
      loadData();
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Check-out failed.' });
    }
  };

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

      {/* Action / Check-in Widget */}
      <div className="checkin-widget">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {isAdmin ? 'Front Desk Gym Entry Check-in' : 'Today’s Workout Session'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isAdmin
              ? 'Scan or select a gym member to record physical entry & exit timestamps.'
              : `Status: ${myTodayActiveCheckin ? 'Currently checked in at gym' : 'Not checked in yet today'}`}
          </p>

          {isAdmin && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <select
                className="form-select"
                style={{ maxWidth: '320px' }}
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => handleCheckIn()}
            disabled={Boolean(myTodayActiveCheckin)}
          >
            🟢 Check In
          </button>
          <button
            className="btn btn-secondary btn-lg"
            onClick={() => handleCheckOut()}
            disabled={!myTodayActiveCheckin}
          >
            🔴 Check Out
          </button>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="card">
        <div className="card-title">
          <span>{isAdmin ? 'All Attendance Logs' : 'My Attendance History'}</span>
          <button className="btn btn-outline btn-sm" onClick={loadData}>
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading attendance history...</p>
        ) : attendanceList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⏱️</div>
            <p className="empty-state-text">No attendance records found.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {isAdmin && <th>Member</th>}
                  <th>Date</th>
                  <th>Check-In Time</th>
                  <th>Check-Out Time</th>
                  <th>Session Status</th>
                  {isAdmin && <th style={{ textAlign: 'right' }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {attendanceList.map((item) => (
                  <tr key={item.id}>
                    {isAdmin && (
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.user?.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {item.user?.email}
                        </div>
                      </td>
                    )}
                    <td style={{ fontWeight: 500 }}>{item.date}</td>
                    <td>
                      {item.checkInTime
                        ? new Date(item.checkInTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </td>
                    <td>
                      {item.checkOutTime
                        ? new Date(item.checkOutTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Active In Gym'}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          item.status === 'COMPLETED' ? 'badge-completed' : 'badge-checked_in'
                        }`}
                      >
                        {item.status === 'COMPLETED' ? 'Completed' : 'Checked In'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: 'right' }}>
                        {item.status === 'CHECKED_IN' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleCheckOut(item.user?.id)}
                          >
                            Force Check-Out
                          </button>
                        )}
                      </td>
                    )}
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
