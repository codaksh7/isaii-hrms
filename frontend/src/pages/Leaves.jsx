import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Check, X, Calendar, FileText } from 'lucide-react';
import './Leaves.css';

const Leaves = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showApply, setShowApply] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [form, setForm] = useState({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });

  const fetchLeaves = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/leaves', { params });
      setLeaves(res.data.data);
    } catch (err) { toast.error('Failed to load leaves'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaves(); }, [statusFilter]);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves', form);
      toast.success('Leave request submitted');
      setShowApply(false);
      setForm({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to apply'); }
  };

  const handleAction = async (status) => {
    try {
      await api.put(`/leaves/${actionTarget._id}`, { status, adminRemarks: remarks });
      toast.success(`Leave ${status}`);
      setActionTarget(null);
      setRemarks('');
      fetchLeaves();
    } catch (err) { toast.error('Action failed'); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  const leaveTypeColors = {
    sick: 'var(--accent-red)', casual: 'var(--accent-blue)',
    earned: 'var(--accent-green)', unpaid: 'var(--accent-amber)'
  };

  return (
    <div className="page-container">
      <motion.div className="page-header flex-between" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="page-title">Leave Management</h1>
          <p className="page-subtitle">{isAdmin ? 'Manage team leave requests' : 'Apply and track your leave requests'}</p>
        </div>
        {!isAdmin && (
          <motion.button className="btn btn-primary" onClick={() => setShowApply(true)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Plus size={18} /> Apply Leave
          </motion.button>
        )}
      </motion.div>

      <motion.div className="filter-bar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="leave-filters">
          {['', 'pending', 'approved', 'rejected'].map(s => (
            <motion.button
              key={s}
              className={`filter-chip ${statusFilter === s ? 'filter-chip-active' : ''}`}
              onClick={() => setStatusFilter(s)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {s || 'All'}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="leave-grid">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 12 }} />)}
        </div>
      ) : leaves.length === 0 ? (
        <div className="empty-state"><Calendar size={48} /><p>No leave requests found</p></div>
      ) : (
        <motion.div className="leave-grid" variants={container} initial="hidden" animate="show">
          {leaves.map((leave) => (
            <motion.div
              key={leave._id}
              className="leave-card"
              variants={item}
              whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}
            >
              <div className="leave-card-header">
                <div className="leave-type-badge" style={{ background: `${leaveTypeColors[leave.leaveType]}18`, color: leaveTypeColors[leave.leaveType] }}>
                  {leave.leaveType}
                </div>
                <span className={`badge badge-${leave.status}`}>{leave.status}</span>
              </div>
              {isAdmin && leave.user && (
                <div className="leave-applicant">
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.65rem' }}>{leave.user.name?.charAt(0)}</div>
                  <div>
                    <p className="leave-applicant-name">{leave.user.name}</p>
                    <p className="leave-applicant-dept">{leave.user.department}</p>
                  </div>
                </div>
              )}
              <div className="leave-dates">
                <div className="leave-date-item">
                  <span className="leave-date-label">From</span>
                  <span className="leave-date-value">{formatDate(leave.startDate)}</span>
                </div>
                <div className="leave-date-sep" />
                <div className="leave-date-item">
                  <span className="leave-date-label">To</span>
                  <span className="leave-date-value">{formatDate(leave.endDate)}</span>
                </div>
                <div className="leave-days-badge">{leave.totalDays}d</div>
              </div>
              <p className="leave-reason">{leave.reason}</p>
              {leave.adminRemarks && <p className="leave-remarks">Remarks: {leave.adminRemarks}</p>}
              {isAdmin && leave.status === 'pending' && (
                <div className="leave-card-actions">
                  <motion.button className="btn btn-sm" style={{ background: 'rgba(76,175,80,0.12)', color: 'var(--accent-green)' }} onClick={() => setActionTarget({ ...leave, action: 'approve' })} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Check size={14} /> Approve
                  </motion.button>
                  <motion.button className="btn btn-sm btn-danger" onClick={() => setActionTarget({ ...leave, action: 'reject' })} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <X size={14} /> Reject
                  </motion.button>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showApply && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowApply(false)}>
            <motion.div className="modal" onClick={e => e.stopPropagation()} initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
              <div className="flex-between" style={{ marginBottom: 20 }}>
                <h2 className="modal-title" style={{ margin: 0 }}>Apply for Leave</h2>
                <button className="btn btn-icon btn-secondary" onClick={() => setShowApply(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleApply}>
                <div className="input-group">
                  <label className="input-label">Leave Type</label>
                  <select className="input-field" value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })}>
                    <option value="casual">Casual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="earned">Earned Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                </div>
                <div className="grid-2">
                  <div className="input-group">
                    <label className="input-label">Start Date</label>
                    <input type="date" className="input-field" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">End Date</label>
                    <input type="date" className="input-field" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Reason</label>
                  <textarea className="input-field" rows={3} style={{ resize: 'vertical' }} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required placeholder="Describe your reason for leave" />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowApply(false)}>Cancel</button>
                  <motion.button type="submit" className="btn btn-primary" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Submit Request</motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {actionTarget && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActionTarget(null)}>
            <motion.div className="modal" onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ maxWidth: 420 }}>
              <h2 className="modal-title">{actionTarget.action === 'approve' ? 'Approve' : 'Reject'} Leave</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
                {actionTarget.action === 'approve' ? 'Approve' : 'Reject'} leave request from <strong>{actionTarget.user?.name}</strong>?
              </p>
              <div className="input-group">
                <label className="input-label">Remarks (Optional)</label>
                <textarea className="input-field" rows={2} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add any remarks" />
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setActionTarget(null)}>Cancel</button>
                <motion.button
                  className="btn"
                  style={actionTarget.action === 'approve' ? { background: 'var(--accent-green)', color: '#fff' } : { background: 'var(--accent-red)', color: '#fff' }}
                  onClick={() => handleAction(actionTarget.action === 'approve' ? 'approved' : 'rejected')}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                >
                  {actionTarget.action === 'approve' ? 'Approve' : 'Reject'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leaves;
