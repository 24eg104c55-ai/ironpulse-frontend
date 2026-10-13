import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

export default function Payments() {
  const { user, isAdmin } = useAuth();
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Record Payment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    paymentMethod: 'CASH',
    status: 'PAID',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        const [paymentsData, membersData] = await Promise.all([
          api.payments.getAll(),
          api.members.getAll(),
        ]);
        setPayments(paymentsData || []);
        setMembers(membersData || []);
      } else {
        const paymentsData = await api.payments.getByUser(user.id);
        setPayments(paymentsData || []);
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Error fetching payment logs.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenRecordModal = () => {
    setFormData({
      userId: members[0]?.id || '',
      amount: '',
      paymentMethod: 'CASH',
      status: 'PAID',
    });
    setIsModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!formData.userId || !formData.amount) {
      setFeedback({ type: 'danger', message: 'Please provide member and payment amount.' });
      return;
    }

    try {
      await api.payments.record({
        userId: Number(formData.userId),
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        status: formData.status,
      });
      setFeedback({ type: 'success', message: 'Payment recorded successfully!' });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Failed to record payment.' });
    }
  };

  const totalCalculated = payments
    .filter((p) => p.status === 'PAID')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

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

      {/* Header and Action */}
      <div className="table-toolbar">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {isAdmin ? 'Payment Transactions History' : 'My Payment History'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Total Paid: <strong>${totalCalculated.toFixed(2)}</strong> across {payments.length} transactions
          </p>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={handleOpenRecordModal}>
            💵 Record New Payment
          </button>
        )}
      </div>

      {/* Payments Table */}
      <div className="card">
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading payments...</p>
        ) : payments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💵</div>
            <p className="empty-state-text">No payment records found.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tx ID</th>
                  {isAdmin && <th>Member Name</th>}
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    {isAdmin && (
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.user?.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.user?.email}</div>
                      </td>
                    )}
                    <td style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>
                      ${Number(p.amount).toFixed(2)}
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{p.paymentMethod}</span>
                    </td>
                    <td>
                      {p.paymentDate
                        ? new Date(p.paymentDate).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '-'}
                    </td>
                    <td>
                      <span className={`badge badge-${p.status?.toLowerCase() || 'paid'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        title="Record Member Payment"
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleRecordPayment}>
          <div className="form-group">
            <label className="form-label">Select Member *</label>
            <select
              className="form-select"
              required
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                required
                placeholder="49.99"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select
                className="form-select"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Credit/Debit Card</option>
                <option value="UPI">UPI / Online</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Status</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem -1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
