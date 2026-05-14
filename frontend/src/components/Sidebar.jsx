import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, CalendarCheck, CalendarOff,
  LogOut, ChevronLeft, ChevronRight, Menu, X, Zap
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef(null);

  const adminLinks = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/employees', icon: Users, label: 'Employees' },
    { path: '/attendance', icon: CalendarCheck, label: 'Attendance' },
    { path: '/leaves', icon: CalendarOff, label: 'Leaves' },
  ];

  const employeeLinks = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/attendance', icon: CalendarCheck, label: 'Attendance' },
    { path: '/leaves', icon: CalendarOff, label: 'Leaves' },
  ];

  const links = user?.role === 'admin' ? adminLinks : employeeLinks;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileOpen]);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
        <Menu size={22} />
      </button>

      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}

      <motion.aside
        ref={sidebarRef}
        className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="sidebar-header">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                className="sidebar-brand"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="brand-icon">
                  <Zap size={20} />
                </div>
                <div>
                  <span className="brand-name">ISAII Ops</span>
                  <span className="brand-sub">HRMS Suite</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {collapsed && (
            <div className="brand-icon brand-icon-only">
              <Zap size={20} />
            </div>
          )}
          <button
            className="collapse-btn desktop-only"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button
            className="collapse-btn mobile-only"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {links.map((link, i) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            >
              <motion.div
                className="nav-link-inner"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <link.icon size={20} className="nav-icon" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="nav-label"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              {location.pathname === link.path && (
                <motion.div
                  className="nav-indicator"
                  layoutId="nav-indicator"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className={`user-card ${collapsed ? 'user-card-collapsed' : ''}`}>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.75rem' }}>
              {initials}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  className="user-info"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="user-name">{user?.name}</span>
                  <span className="user-role">{user?.role}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.button
            className="logout-btn"
            onClick={logout}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            title="Logout"
          >
            <LogOut size={18} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
