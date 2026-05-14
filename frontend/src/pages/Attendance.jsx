import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Clock, LogIn, LogOut, CalendarDays, Filter } from 'lucide-react';
import './Attendance.css';

const Attendance = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [records, setRecords] = useState([]);
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchRecords = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await api.get('/attendance', { params });
      setRecords(res.data.data);
    } catch (err) { toast.error('Failed to load records'); }
    finally { setLoading(false); }
  };

  const fetchToday = async () => {
    try {
      const res = await api.get('/attendance/today');
      setTodayStatus(res.data.data);
    } catch (err) { /* ignore */ }
  };

  useEffect(() => { fetchRecords(); fetchToday(); }, [startDate, endDate]);

  const handleCheckIn = async () => {
    setChecking(true);
    try {
      await api.post('/attendance/check-in');
      toast.success('Checked in successfully!');
      fetchToday(); fetchRecords();
    } catch (err) { toast.error(err.response?.data?.message || 'Check-in failed'); }
    finally { setChecking(false); }
  };

  const handleCheckOut = async () => {
    setChecking(true);
    try {
      await api.post('/attendance/check-out');
      toast.success('Checked out successfully!');
      fetchToday(); fetchRecords();
    } catch (err) { toast.error(err.response?.data?.message || 'Check-out failed'); }
    finally { setChecking(false); }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentTime.getSeconds().toString().padStart(2, '0');

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
  const row = { hidden: { opacity: 0, x: -15 }, show: { opacity: 1, x: 0 } };

  return (
    <div className="page-container">
      <motion.div className="page-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">Attendance</h1>
        <p className="page-subtitle">Track your daily attendance and work hours</p>
      </motion.div>

      {!isAdmin && (
        <motion.div className="checkin-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="clock-display">
            <div className="clock-digits">
              <motion.span className="clock-digit" key={hours} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{hours}</motion.span>
              <span className="clock-sep">:</span>
              <motion.span className="clock-digit" key={minutes} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{minutes}</motion.span>
              <span className="clock-sep">:</span>
              <motion.span className="clock-digit clock-digit-sec" key={seconds} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{seconds}</motion.span>
            </div>
            <p className="clock-date">{currentTime.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="checkin-actions">
            {!todayStatus ? (
              <motion.button className="checkin-btn checkin-btn-in" onClick={handleCheckIn} disabled={checking} whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(76,175,80,0.3)' }} whileTap={{ scale: 0.95 }}>
                <LogIn size={22} />
                <span>Check In</span>
              </motion.button>
            ) : !todayStatus.checkOut ? (
              <motion.button className="checkin-btn checkin-btn-out" onClick={handleCheckOut} disabled={checking} whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(239,83,80,0.3)' }} whileTap={{ scale: 0.95 }}>
                <LogOut size={22} />
                <span>Check Out</span>
              </motion.button>
            ) : (
              <div className="checkin-done">
                <CalendarDays size={20} />
                <span>Attendance marked for today</span>
              </div>
            )}
          </div>
          {todayStatus && (
            <motion.div className="today-summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <div className="today-item"><span className="today-label">Check In</span><span className="today-value">{formatTime(todayStatus.checkIn)}</span></div>
              <div className="today-item"><span className="today-label">Check Out</span><span className="today-value">{formatTime(todayStatus.checkOut)}</span></div>
              <div className="today-item"><span className="today-label">Hours</span><span className="today-value">{todayStatus.workHours || 0}h</span></div>
              <div className="today-item"><span className="today-label">Status</span><span className={`badge badge-${todayStatus.status}`}>{todayStatus.status}</span></div>
            </motion.div>
          )}
        </motion.div>
      )}

      <motion.div className="filter-bar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex-gap">
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <input type="date" className="input-field" style={{ maxWidth: 170 }} value={startDate} onChange={e => setStartDate(e.target.value)} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>to</span>
          <input type="date" className="input-field" style={{ maxWidth: 170 }} value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </motion.div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />)}
        </div>
      ) : records.length === 0 ? (
        <div className="empty-state"><Clock size={48} /><p>No attendance records found</p></div>
      ) : (
        <motion.div className="table-container" variants={container} initial="hidden" animate="show">
          <table className="table">
            <thead>
              <tr>
                {isAdmin && <th>Employee</th>}
                <th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <motion.tr key={rec._id} variants={row}>
                  {isAdmin && (
                    <td>
                      <div className="emp-cell">
                        <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.7rem' }}>{(rec.user?.name || 'U').charAt(0)}</div>
                        <span style={{ fontSize: '0.85rem' }}>{rec.user?.name || 'Unknown'}</span>
                      </div>
                    </td>
                  )}
                  <td className="text-mono">{rec.date}</td>
                  <td className="text-mono">{formatTime(rec.checkIn)}</td>
                  <td className="text-mono">{formatTime(rec.checkOut)}</td>
                  <td className="text-mono">{rec.workHours}h</td>
                  <td><span className={`badge badge-${rec.status}`}>{rec.status}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default Attendance;
