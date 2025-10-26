import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SignupForm = () => {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'student',
    universalPassword: '' 
  });
  const [showUniversalPassword, setShowUniversalPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Show/hide universal password field based on role
    if (name === 'role') {
      setShowUniversalPassword(value === 'coordinator' || value === 'admin');
      if (value === 'student') {
        setForm(prev => ({ ...prev, universalPassword: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://event-management-1-gg05.onrender.com/api/auth/signup', form);
      toast.success(res.data.message || 'Signup successful! Now login.');
      setForm({ name: '', email: '', password: '', role: 'student', universalPassword: '' });
      setShowUniversalPassword(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 mx-auto" style={{ maxWidth: '400px' }}>
      <h2 className="text-center mb-3">Sign Up</h2>
      
      <div className="mb-3">
        <input 
          className="form-control" 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          placeholder="Name" 
          required 
        />
      </div>

      <div className="mb-3">
        <input 
          className="form-control" 
          name="email" 
          type="email"
          value={form.email} 
          onChange={handleChange} 
          placeholder="Email" 
          required 
        />
      </div>

      <div className="mb-3">
        <input 
          className="form-control" 
          name="password" 
          type="password" 
          value={form.password} 
          onChange={handleChange} 
          placeholder="Password" 
          required 
        />
      </div>

      <div className="mb-3">
        <select 
          className="form-control" 
          name="role" 
          value={form.role} 
          onChange={handleChange}
        >
          <option value="student">Student</option>
          <option value="coordinator">Coordinator</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Universal Password Field - Only for Coordinator/Admin */}
      {showUniversalPassword && (
        <div className="mb-3">
          <label className="form-label small text-muted">
            {form.role === 'admin' ? 'Admin' : 'Coordinator'} Access Password *
          </label>
          <input 
            className="form-control" 
            name="universalPassword" 
            type="password" 
            value={form.universalPassword} 
            onChange={handleChange} 
            placeholder={`Enter ${form.role} password`}
            required 
          />
          <small className="text-muted">
            Contact administrator to get access password
          </small>
        </div>
      )}

      <button className="btn btn-success w-100" type="submit">
        Sign Up
      </button>

      {showUniversalPassword && (
        <div className="alert alert-info mt-3 small mb-0">
          <strong>🔒 Restricted Access:</strong>
          <br />
          {form.role === 'admin' ? 'Admin' : 'Coordinator'} accounts require authorization. 
          Contact your college administration for the access password.
        </div>
      )}
    </form>
  );
};

export default SignupForm;
