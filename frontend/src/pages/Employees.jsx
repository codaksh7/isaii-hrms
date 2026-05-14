import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Search, Edit3, Trash2, X, UserPlus, Filter, Eye, EyeOff, Building } from 'lucide-react';
import './Employees.css';

const Employees = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [form, setForm] = useState({ name:'', email:'', password:'', department:'', position:'', phone:'', salary:'' });

  const fetchEmployees = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (deptFilter) params.department = deptFilter;
      const res = await api.get('/employees', { params });
      setEmployees(res.data.data);
    } catch (err) {
      toast.error('Failed to load employees');
    } finally { setLoading(false); }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/employees/departments');
      setDepartments(res.data.data);
    } catch (err) { /* ignore */ }
  };

  useEffect(() => { fetchEmployees(); fetchDepartments(); }, [search, deptFilter]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name:'', email:'', password:'employee123', department:'', position:'', phone:'', salary:'' });
    setShowModal(true);
  };
  const openEdit = (emp) => {
    setEditing(emp);
    setForm({ name:emp.name, email:emp.email, password:'', department:emp.department, position:emp.position, phone:emp.phone||'', salary:emp.salary||'' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return toast.error('Invalid email address');
    if (form.phone && !/^\d{10}$/.test(form.phone.trim())) return toast.error('Phone number must be exactly 10 digits');

    try {
      if (editing) {
        await api.put(`/employees/${editing._id}`, form);
        toast.success('Employee updated');
      } else {
        await api.post('/employees', form);
        toast.success('Employee added');
      }
      setShowModal(false);
      fetchEmployees();
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/employees/${deleteTarget._id}`);
      toast.success('Employee removed');
      setDeleteTarget(null);
      fetchEmployees();
      fetchDepartments();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleAddDept = (e) => {
    e.preventDefault();
    const cleanDept = newDeptName.trim();
    if (!cleanDept) return;
    if (!departments.includes(cleanDept)) {
      setDepartments([...departments, cleanDept]);
      toast.success(`Department "${cleanDept}" added to options`);
    } else {
      toast.error('Department already exists');
    }
    setNewDeptName('');
    setShowDeptModal(false);
  };

  const container = { hidden:{opacity:0}, show:{opacity:1, transition:{staggerChildren:0.04}} };
  const row = { hidden:{opacity:0,x:-15}, show:{opacity:1,x:0,transition:{duration:0.3}} };

  return (
    <div className="page-container">
      <motion.div className="page-header flex-between" initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}>
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{employees.length} team members across the organization</p>
        </div>
        {isAdmin && (
          <div style={{display:'flex', gap: '12px'}}>
            <motion.button className="btn btn-secondary" onClick={() => setShowDeptModal(true)} whileHover={{scale:1.04}} whileTap={{scale:0.97}}>
              <Building size={18} /> Add Department
            </motion.button>
            <motion.button className="btn btn-primary" onClick={openAdd} whileHover={{scale:1.04}} whileTap={{scale:0.97}}>
              <UserPlus size={18} /> Add Employee
            </motion.button>
          </div>
        )}
      </motion.div>

      <motion.div className="filter-bar" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
        <div className="search-bar" style={{flex:1,maxWidth:360}}>
          <Search size={18} />
          <input placeholder="Search by name, email, or position" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-select-wrap">
          <Filter size={16} className="filter-icon" />
          <select className="input-field filter-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </motion.div>

      {loading ? (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{height:56,borderRadius:8}} />)}
        </div>
      ) : employees.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <p>No employees found</p>
        </div>
      ) : (
        <motion.div className="table-container" variants={container} initial="hidden" animate="show">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Position</th>
                <th>Phone</th>
                <th>Status</th>
                {isAdmin && <th style={{textAlign:'right'}}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <motion.tr key={emp._id} variants={row} whileHover={{backgroundColor:'rgba(0,229,255,0.02)'}}>
                  <td>
                    <div className="emp-cell">
                      <div className="avatar">{emp.name.charAt(0)}</div>
                      <div>
                        <p className="emp-name">{emp.name}</p>
                        <p className="emp-email">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-employee">{emp.department}</span></td>
                  <td>{emp.position}</td>
                  <td className="text-mono">{emp.phone || 'N/A'}</td>
                  <td><span className={`badge ${emp.isActive !== false ? 'badge-present' : 'badge-absent'}`}>{emp.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                  {isAdmin && (
                    <td style={{textAlign:'right'}}>
                      <div className="action-btns">
                        <motion.button className="btn btn-icon btn-secondary" onClick={() => openEdit(emp)} whileHover={{scale:1.1}} whileTap={{scale:0.9}} title="Edit">
                          <Edit3 size={15} />
                        </motion.button>
                        <motion.button className="btn btn-icon btn-danger" onClick={() => setDeleteTarget(emp)} whileHover={{scale:1.1}} whileTap={{scale:0.9}} title="Delete">
                          <Trash2 size={15} />
                        </motion.button>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setShowModal(false)}>
            <motion.div className="modal" onClick={e => e.stopPropagation()} initial={{opacity:0,y:40,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:40,scale:0.95}} transition={{type:'spring',stiffness:300,damping:25}}>
              <div className="flex-between" style={{marginBottom:20}}>
                <h2 className="modal-title" style={{margin:0}}>{editing ? 'Edit Employee' : 'Add Employee'}</h2>
                <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="grid-2">
                  <div className="input-group">
                    <label className="input-label">Full Name</label>
                    <input className="input-field" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email</label>
                    <input className="input-field" type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
                  </div>
                </div>
                {!editing && (
                  <div className="input-group">
                    <label className="input-label">Password</label>
                    <div style={{position:'relative', display:'flex', alignItems:'center'}}>
                      <input className="input-field" type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password:e.target.value})} required style={{width:'100%', paddingRight:'40px'}} />
                      <button type="button" onClick={() => setShowPw(!showPw)} style={{position:'absolute', right:12, background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', display:'flex'}}>
                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}
                <div className="grid-2">
                  <div className="input-group">
                    <label className="input-label">Department</label>
                    <select className="input-field" value={form.department} onChange={e => setForm({...form, department:e.target.value})} required>
                      <option value="" disabled>Select Department</option>
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Position</label>
                    <input className="input-field" value={form.position} onChange={e => setForm({...form, position:e.target.value})} required />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="input-group">
                    <label className="input-label">Phone</label>
                    <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Salary</label>
                    <input className="input-field" type="number" value={form.salary} onChange={e => setForm({...form, salary:e.target.value})} />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <motion.button type="submit" className="btn btn-primary" whileHover={{scale:1.03}} whileTap={{scale:0.97}}>
                    {editing ? 'Save Changes' : 'Add Employee'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setDeleteTarget(null)}>
            <motion.div className="modal" onClick={e => e.stopPropagation()} initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}} style={{maxWidth:400,textAlign:'center'}}>
              <motion.div animate={{x:[0,-6,6,-4,4,0]}} transition={{duration:0.4}}>
                <Trash2 size={40} style={{color:'var(--accent-red)',marginBottom:16}} />
              </motion.div>
              <h2 className="modal-title">Remove Employee</h2>
              <p style={{color:'var(--text-secondary)',fontSize:'0.9rem',marginBottom:24}}>
                Are you sure you want to remove <strong>{deleteTarget.name}</strong>? This action cannot be undone.
              </p>
              <div className="modal-actions" style={{justifyContent:'center'}}>
                <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <motion.button className="btn btn-danger" onClick={handleDelete} whileHover={{scale:1.03}} whileTap={{scale:0.97}}>
                  Remove
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeptModal && (
          <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setShowDeptModal(false)}>
            <motion.div className="modal" onClick={e => e.stopPropagation()} initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}} style={{maxWidth:400}}>
              <div className="flex-between" style={{marginBottom:20}}>
                <h2 className="modal-title" style={{margin:0}}>Add Department</h2>
                <button className="btn btn-icon btn-secondary" onClick={() => setShowDeptModal(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleAddDept}>
                <div className="input-group">
                  <label className="input-label">Department Name</label>
                  <input className="input-field" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} required placeholder="e.g. Finance" />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowDeptModal(false)}>Cancel</button>
                  <motion.button type="submit" className="btn btn-primary" whileHover={{scale:1.03}} whileTap={{scale:0.97}}>Add Option</motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Employees;
