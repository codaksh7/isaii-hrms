import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.4 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 60; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 229, 255, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const shapes = [
    { size: 80, top: '10%', left: '8%', delay: 0, dur: 7 },
    { size: 50, top: '70%', left: '5%', delay: 1, dur: 9 },
    { size: 120, top: '20%', right: '6%', delay: 2, dur: 8 },
    { size: 35, top: '80%', right: '10%', delay: 0.5, dur: 6 },
    { size: 60, top: '50%', left: '15%', delay: 1.5, dur: 10 },
    { size: 45, top: '35%', right: '18%', delay: 3, dur: 7.5 },
  ];

  return (
    <div className="login-page">
      <canvas ref={canvasRef} className="login-canvas" />

      {shapes.map((s, i) => (
        <motion.div
          key={i}
          className="floating-shape"
          style={{
            width: s.size, height: s.size,
            top: s.top, left: s.left, right: s.right,
          }}
          animate={{
            y: [0, -25, 0, 15, 0],
            rotate: [0, 5, -3, 2, 0],
            scale: [1, 1.05, 0.98, 1.02, 1],
          }}
          transition={{
            duration: s.dur, repeat: Infinity, delay: s.delay,
            ease: 'easeInOut'
          }}
        />
      ))}

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <motion.div
          className="login-brand"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="login-brand-icon">
            <Zap size={28} />
          </div>
          <h1 className="login-title">ISAII Ops</h1>
          <p className="login-subtitle">Human Resource Management Suite</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="login-form">
          <motion.div
            className="input-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="input-label">Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@isaii.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />
          </motion.div>

          <motion.div
            className="input-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="input-label">Password</label>
            <div className="password-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                className="input-field"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw(!showPw)}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </motion.div>

          <motion.button
            type="submit"
            className="login-btn"
            disabled={loading}
            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(0,229,255,0.3)' }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {loading ? (
              <span className="login-spinner" />
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        <motion.div
          className="login-demo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="demo-title">Quick Access (Demo)</p>
          <div className="demo-cards">
            <button
              type="button"
              className="demo-card"
              onClick={() => { setEmail('admin@isaii.in'); setPassword('admin123'); }}
            >
              <span className="demo-role">Admin</span>
              <span className="demo-email">admin@isaii.in</span>
            </button>
            <button
              type="button"
              className="demo-card"
              onClick={() => { setEmail('arjun@isaii.in'); setPassword('employee123'); }}
            >
              <span className="demo-role">Employee</span>
              <span className="demo-email">arjun@isaii.in</span>
            </button>
          </div>
        </motion.div>
        <motion.p
          className="login-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Crafted for Team ISAII
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
