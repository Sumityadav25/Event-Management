import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const LoginForm = ({ onLoginSuccess }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('https://event-management-1-gg05.onrender.com/api/auth/login', form);
      
      console.log('=== LOGIN SUCCESS ===');
      console.log('Token:', res.data.token?.substring(0, 20) + '...');
      console.log('User:', res.data.user);

      // Save token and user FIRST
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Show success message
      toast.success('Login successful!');

      // IMPORTANT: Small delay to ensure localStorage is written
      // Then call parent callback
      setTimeout(() => {
        onLoginSuccess(res.data.user);
      }, 100);

    } catch (error) {
      console.error('=== LOGIN ERROR ===');
      console.error('Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 mx-auto" style={{ maxWidth: '400px' }}>
      <h2 className="text-center mb-3">🔐 Login</h2>
      
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          className="form-control"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
          autoComplete="email"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Password</label>
        <input
          className="form-control"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
          autoComplete="current-password"
        />
      </div>

      <button className="btn btn-primary w-100" type="submit" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </button>
    </form>
  );
};

export default LoginForm;
