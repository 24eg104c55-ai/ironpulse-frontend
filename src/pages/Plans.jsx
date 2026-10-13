import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

export default function Plans() {
  const { isAdmin } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    durationDays: 30,
    description: '',
    active: true,
  });

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await api.plans.getAll();
      setPlans(data || []);
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Failed to load plans.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleOpenAddModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      price: '',
      durationDays: 30,
      description: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      durationDays: plan.durationDays,
      description: plan.description || '',
      active: plan.active !== false,
    });
    setIsModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name.trim(),
        price: Number(formData.price),
        durationDays: Number(formData.durationDays),
        description: formData.description.trim(),
        active: formData.active,
      };

      if (editingPlan) {
        await api.plans.update(editingPlan.id, payload);
        setFeedback({ type: 'success', message: 'Plan updated successfully!' });
      } else {
        await api.plans.create(payload);
        setFeedback({ type: 'success', message: 'New plan created successfully!' });
      }
      setIsModalOpen(false);
      loadPlans();
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Operation failed.' });
    }
  };

  const handleDeletePlan = async (id, name) => {
    if (!window.confirm(`Delete plan "${name}"?`)) return;
    try {
      await api.plans.delete(id);
      setFeedback({ type: 'success', message: 'Plan deleted.' });
      loadPlans();
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Could not delete plan.' });
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

      <div className="table-toolbar">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Available Membership Packages</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Flexible membership options tailored for fitness enthusiasts.
          </p>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            ➕ Create New Plan
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading packages...</p>
      ) : plans.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">💳</div>
            <p className="empty-state-text">No membership plans created yet.</p>
          </div>
        </div>
      ) : (
        <div className="plans-grid">
          {plans.map((plan) => (
            <div key={plan.id} className="plan-card">
              <div className="plan-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 className="plan-name">{plan.name}</h3>
                  <span className={`badge ${plan.active ? 'badge-active' : 'badge-expired'}`}>
                    {plan.active ? 'Available' : 'Archived'}
                  </span>
                </div>
                <div className="plan-duration">⏱️ Valid for {plan.durationDays} days</div>
              </div>

              <div className="plan-price">
                <span className="plan-price-currency">$</span>
                {Number(plan.price).toFixed(2)}
              </div>

              <p className="plan-description">
                {plan.description || 'Full gym facility access during working hours.'}
              </p>

              {isAdmin && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => handleOpenEditModal(plan)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeletePlan(plan.id, plan.name)}
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Plan Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create Membership Plan'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSavePlan}>
          <div className="form-group">
            <label className="form-label">Plan Name *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Platinum 6-Months"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                className="form-input"
                required
                placeholder="49.99"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duration (Days) *</label>
              <input
                type="number"
                min="1"
                className="form-input"
                required
                placeholder="30"
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description & Perks</label>
            <textarea
              className="form-textarea"
              placeholder="Full gym floor access, locker, sauna, free locker towel..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="planActive"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            <label htmlFor="planActive" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
              Plan is Active and available for enrollment
            </label>
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
              {editingPlan ? 'Update Plan' : 'Save Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
