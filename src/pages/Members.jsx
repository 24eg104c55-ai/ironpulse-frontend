import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Add/Edit Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  // Assign Plan Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedMemberForPlan, setSelectedMemberForPlan] = useState(null);
  const [assignForm, setAssignForm] = useState({
    planId: '',
    startDate: new Date().toISOString().split('T')[0],
    recordPayment: true,
    paymentMethod: 'CASH',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [membersData, plansData] = await Promise.all([
        api.members.getAll(),
        api.plans.getAll(),
      ]);
      setMembers(membersData || []);
      setPlans(plansData || []);
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Error loading members.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter members by search input
  const filteredMembers = members.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      m.name?.toLowerCase().includes(term) ||
      m.email?.toLowerCase().includes(term) ||
      m.phone?.toLowerCase().includes(term)
    );
  });

  // Open modal to add a new member
  const handleOpenAddModal = () => {
    setEditingMember(null);
    setMemberForm({ name: '', email: '', password: '', phone: '' });
    setIsMemberModalOpen(true);
  };

  // Open modal to edit an existing member
  const handleOpenEditModal = (member) => {
    setEditingMember(member);
    setMemberForm({
      name: member.name || '',
      email: member.email || '',
      password: '', // Blank unless changing
      phone: member.phone || '',
    });
    setIsMemberModalOpen(true);
  };

  // Save (Create or Update) Member
  const handleSaveMember = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await api.members.update(editingMember.id, memberForm);
        setFeedback({ type: 'success', message: 'Member updated successfully!' });
      } else {
        if (!memberForm.password) {
          setFeedback({ type: 'danger', message: 'Password is required for new member.' });
          return;
        }
        await api.members.create(memberForm);
        setFeedback({ type: 'success', message: 'Member added successfully!' });
      }
      setIsMemberModalOpen(false);
      loadData();
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Operation failed.' });
    }
  };

  // Delete Member
  const handleDeleteMember = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete member "${name}"?`)) return;

    try {
      await api.members.delete(id);
      setFeedback({ type: 'success', message: 'Member deleted successfully.' });
      loadData();
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Failed to delete member.' });
    }
  };

  // Open Assign Plan Modal
  const handleOpenAssignModal = (member) => {
    setSelectedMemberForPlan(member);
    setAssignForm({
      planId: plans[0]?.id || '',
      startDate: new Date().toISOString().split('T')[0],
      recordPayment: true,
      paymentMethod: 'CASH',
    });
    setIsAssignModalOpen(true);
  };

  // Submit Plan Assignment
  const handleAssignPlan = async (e) => {
    e.preventDefault();
    if (!assignForm.planId) {
      setFeedback({ type: 'danger', message: 'Please select a valid membership plan.' });
      return;
    }

    try {
      await api.memberships.assign({
        userId: selectedMemberForPlan.id,
        planId: Number(assignForm.planId),
        startDate: assignForm.startDate,
        recordPayment: assignForm.recordPayment,
        paymentMethod: assignForm.paymentMethod,
      });
      setFeedback({
        type: 'success',
        message: `Plan assigned to ${selectedMemberForPlan.name} successfully!`,
      });
      setIsAssignModalOpen(false);
      loadData();
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Failed to assign plan.' });
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

      {/* Toolbar: Search & Add button */}
      <div className="table-toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search members by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          ➕ Add New Member
        </button>
      </div>

      {/* Members Table */}
      <div className="card">
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading members list...</p>
        ) : filteredMembers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p className="empty-state-text">No members found matching your search.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Contact</th>
                  <th>Current Plan</th>
                  <th>Plan Status</th>
                  <th>Expiry Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{member.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Member ID: #{member.id}
                      </div>
                    </td>
                    <td>
                      <div>{member.email}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {member.phone || 'No phone'}
                      </div>
                    </td>
                    <td>
                      {member.currentPlanName ? (
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                          {member.currentPlanName}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>No Plan</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${member.membershipStatus?.toLowerCase() || 'no_plan'}`}>
                        {member.membershipStatus || 'NO PLAN'}
                      </span>
                    </td>
                    <td>{member.membershipEndDate || '-'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Assign or Renew Membership Plan"
                          onClick={() => handleOpenAssignModal(member)}
                        >
                          💳 Plan
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          title="Edit member"
                          onClick={() => handleOpenEditModal(member)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          title="Delete member"
                          onClick={() => handleDeleteMember(member.id, member.name)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Member Modal */}
      <Modal
        isOpen={isMemberModalOpen}
        title={editingMember ? `Edit Member: ${editingMember.name}` : 'Add New Gym Member'}
        onClose={() => setIsMemberModalOpen(false)}
      >
        <form onSubmit={handleSaveMember}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              required
              value={memberForm.name}
              onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
              placeholder="e.g. Alex Walker"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-input"
              required
              value={memberForm.email}
              onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
              placeholder="alex@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Password {editingMember ? '(Leave blank to keep unchanged)' : '*'}
            </label>
            <input
              type="password"
              className="form-input"
              required={!editingMember}
              value={memberForm.password}
              onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              value={memberForm.phone}
              onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
              placeholder="9876543210"
            />
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem -1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsMemberModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingMember ? 'Save Changes' : 'Create Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Plan Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        title={`Assign Plan to ${selectedMemberForPlan?.name}`}
        onClose={() => setIsAssignModalOpen(false)}
      >
        <form onSubmit={handleAssignPlan}>
          <div className="form-group">
            <label className="form-label">Select Membership Plan *</label>
            <select
              className="form-select"
              required
              value={assignForm.planId}
              onChange={(e) => setAssignForm({ ...assignForm, planId: e.target.value })}
            >
              <option value="">-- Choose a Plan --</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - ${p.price} ({p.durationDays} days)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Start Date *</label>
            <input
              type="date"
              className="form-input"
              required
              value={assignForm.startDate}
              onChange={(e) => setAssignForm({ ...assignForm, startDate: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="recordPayment"
              checked={assignForm.recordPayment}
              onChange={(e) => setAssignForm({ ...assignForm, recordPayment: e.target.checked })}
            />
            <label htmlFor="recordPayment" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
              Automatically record payment for this plan
            </label>
          </div>

          {assignForm.recordPayment && (
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={assignForm.paymentMethod}
                onChange={(e) => setAssignForm({ ...assignForm, paymentMethod: e.target.value })}
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Credit/Debit Card</option>
                <option value="UPI">UPI / Online</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
          )}

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem -1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsAssignModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              Assign & Activate Plan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
