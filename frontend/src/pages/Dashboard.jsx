import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import api from '../utils/api';
import {
  Users, CalendarCheck, CalendarOff, Clock,
  TrendingUp, UserCheck, AlertCircle, CheckCircle
} from 'lucide-react';
import './Dashboard.css';

const AnimatedNumber = ({ value }) => {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    delay: 200,
    config: { mass: 1, tension: 80, friction: 20 }
  });
  return <animated.span>{number.to(n => Math.floor(n))}</animated.span>;
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div className="page-container">
      <div className="stat-grid">
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{height:140,borderRadius:12}} />)}
      </div>
      <div className="grid-2">
        <div className="skeleton" style={{height:300,borderRadius:12}} />
        <div className="skeleton" style={{height:300,borderRadius:12}} />
      </div>
    </div>
  );

  if (!data) return <div className="page-container"><p>Failed to load dashboard</p></div>;

  const isAdmin = user?.role === 'admin';

  const adminStats = isAdmin ? [
    { label: 'Total Employees', value: data.employees?.total || 0, icon: Users, color: 'var(--accent-cyan)', bg: 'rgba(0,229,255,0.1)' },
    { label: 'Present Today', value: data.attendance?.today || 0, icon: UserCheck, color: 'var(--accent-green)', bg: 'rgba(76,175,80,0.1)' },
    { label: 'Pending Leaves', value: data.leaves?.pending || 0, icon: AlertCircle, color: 'var(--accent-amber)', bg: 'rgba(255,179,0,0.1)' },
    { label: 'Approved Leaves', value: data.leaves?.approved || 0, icon: CheckCircle, color: 'var(--accent-purple)', bg: 'rgba(171,71,188,0.1)' },
  ] : [];

  const empStats = !isAdmin ? [
    { label: 'Days Present', value: data.attendance?.monthly?.present || 0, icon: CalendarCheck, color: 'var(--accent-green)', bg: 'rgba(76,175,80,0.1)' },
    { label: 'Days Absent', value: data.attendance?.monthly?.absent || 0, icon: CalendarOff, color: 'var(--accent-red)', bg: 'rgba(239,83,80,0.1)' },
    { label: 'Pending Leaves', value: data.leaves?.pending || 0, icon: Clock, color: 'var(--accent-amber)', bg: 'rgba(255,179,0,0.1)' },
    { label: 'Approved Leaves', value: data.leaves?.approved || 0, icon: CheckCircle, color: 'var(--accent-cyan)', bg: 'rgba(0,229,255,0.1)' },
  ] : [];

  const stats = isAdmin ? adminStats : empStats;

  const attendanceData = isAdmin ? data.attendance?.monthly : data.attendance?.monthly;
  const totalAttendance = (attendanceData?.present || 0) + (attendanceData?.absent || 0) + (attendanceData?.halfDay || 0);

  return (
    <div className="page-container">
      <motion.div className="page-header" initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{duration:0.4}}>
        <h1 className="page-title">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="page-subtitle">
          {isAdmin ? 'Here is your organization overview for this month' : 'Here is your personal overview for this month'}
        </p>
      </motion.div>

      <motion.div className="stat-grid" variants={container} initial="hidden" animate="show">
        {stats.map((s, i) => (
          <motion.div className="stat-card" key={i} variants={item} whileHover={{y:-4,boxShadow:'0 8px 30px rgba(0,0,0,0.4)'}}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              <s.icon size={22} />
            </div>
            <div className="stat-value" style={{ color: s.color }}>
              <AnimatedNumber value={s.value} />
            </div>
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid-2">
        <motion.div className="card" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}}>
          <h3 className="card-title">Attendance Overview</h3>
          <div className="donut-wrap">
            <svg viewBox="0 0 200 200" className="donut-chart">
              {totalAttendance > 0 ? (
                <>
                  <DonutSlice value={attendanceData?.present || 0} total={totalAttendance} offset={0} color="var(--accent-green)" />
                  <DonutSlice value={attendanceData?.absent || 0} total={totalAttendance} offset={attendanceData?.present || 0} color="var(--accent-red)" />
                  <DonutSlice value={attendanceData?.halfDay || 0} total={totalAttendance} offset={(attendanceData?.present || 0) + (attendanceData?.absent || 0)} color="var(--accent-purple)" />
                </>
              ) : (
                <circle cx="100" cy="100" r="70" fill="none" stroke="var(--border-color)" strokeWidth="18" />
              )}
              <text x="100" y="95" textAnchor="middle" className="donut-center-value">{totalAttendance}</text>
              <text x="100" y="115" textAnchor="middle" className="donut-center-label">Total Days</text>
            </svg>
            <div className="donut-legend">
              <div className="legend-item"><span className="legend-dot" style={{background:'var(--accent-green)'}} />Present: {attendanceData?.present || 0}</div>
              <div className="legend-item"><span className="legend-dot" style={{background:'var(--accent-red)'}} />Absent: {attendanceData?.absent || 0}</div>
              <div className="legend-item"><span className="legend-dot" style={{background:'var(--accent-purple)'}} />Half Day: {attendanceData?.halfDay || 0}</div>
            </div>
          </div>
        </motion.div>

        <motion.div className="card" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.5}}>
          <h3 className="card-title">Recent Leave Requests</h3>
          <div className="recent-list">
            {data.recentLeaves?.length > 0 ? data.recentLeaves.map((leave, i) => (
              <motion.div
                key={leave._id || i}
                className="recent-item"
                initial={{opacity:0,x:20}}
                animate={{opacity:1,x:0}}
                transition={{delay:0.6 + i*0.08}}
              >
                <div className="recent-item-left">
                  <div className="avatar" style={{width:32,height:32,fontSize:'0.7rem'}}>
                    {(leave.user?.name || 'U').charAt(0)}
                  </div>
                  <div>
                    <p className="recent-name">{leave.user?.name || user?.name}</p>
                    <p className="recent-meta">{leave.leaveType} / {leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <span className={`badge badge-${leave.status}`}>{leave.status}</span>
              </motion.div>
            )) : (
              <p className="text-muted" style={{padding:20,textAlign:'center',fontSize:'0.85rem',color:'var(--text-muted)'}}>No recent leave requests</p>
            )}
          </div>
        </motion.div>
      </div>

      {isAdmin && data.departmentStats?.length > 0 && (
        <motion.div className="card" style={{marginTop:20}} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.6}}>
          <h3 className="card-title">Department Distribution</h3>
          <div className="dept-bars">
            {data.departmentStats.map((dept, i) => {
              const maxCount = Math.max(...data.departmentStats.map(d => d.count));
              return (
                <motion.div key={dept._id} className="dept-bar-row" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:0.7+i*0.08}}>
                  <span className="dept-name">{dept._id}</span>
                  <div className="dept-bar-track">
                    <motion.div
                      className="dept-bar-fill"
                      initial={{width:0}}
                      animate={{width:`${(dept.count/maxCount)*100}%`}}
                      transition={{delay:0.9+i*0.1,duration:0.6,ease:'easeOut'}}
                    />
                  </div>
                  <span className="dept-count">{dept.count}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {isAdmin && data.recentEmployees?.length > 0 && (
        <motion.div className="card" style={{marginTop:20}} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.7}}>
          <h3 className="card-title">Recently Added</h3>
          <div className="recent-list">
            {data.recentEmployees.map((emp, i) => (
              <motion.div key={emp._id} className="recent-item" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.8+i*0.06}}>
                <div className="recent-item-left">
                  <div className="avatar" style={{width:32,height:32,fontSize:'0.7rem'}}>{emp.name.charAt(0)}</div>
                  <div>
                    <p className="recent-name">{emp.name}</p>
                    <p className="recent-meta">{emp.position}, {emp.department}</p>
                  </div>
                </div>
                <span className="badge badge-employee">{emp.department}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const DonutSlice = ({ value, total, offset, color }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? value / total : 0;
  const dashLen = pct * circumference;
  const dashOffset = -(offset / total) * circumference;

  return (
    <motion.circle
      cx="100" cy="100" r={radius}
      fill="none" stroke={color} strokeWidth="18"
      strokeDasharray={`${dashLen} ${circumference - dashLen}`}
      strokeDashoffset={dashOffset}
      strokeLinecap="round"
      transform="rotate(-90 100 100)"
      initial={{ strokeDasharray: `0 ${circumference}` }}
      animate={{ strokeDasharray: `${dashLen} ${circumference - dashLen}` }}
      transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
    />
  );
};

export default Dashboard;
