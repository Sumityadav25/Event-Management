import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import DashboardStudent from './components/DashboardStudent';
import DashboardCoordinator from './components/DashboardCoordinator';

// Axios interceptors
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/login')) {
      toast.error('Session expired. Please login again.');
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setCurrentView('dashboard');
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('login');
    toast.info('Logged out successfully');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme="dark"
        closeButton={true}
      />
      
      {!user ? (
        <div className="auth-container">
          <div className="auth-box">
            <div className="auth-header">
              <h1 className="brand-title">🎓 College Events</h1>
              <p className="brand-subtitle">Manage and organize events seamlessly</p>
            </div>

            {currentView === 'login' && (
              <div>
                <LoginForm onLoginSuccess={handleLoginSuccess} />
                <p className="auth-switch">
                  Don't have an account?{' '}
                  <button className="link-btn" onClick={() => setCurrentView('signup')}>
                    Sign Up
                  </button>
                </p>
              </div>
            )}

            {currentView === 'signup' && (
              <div>
                <SignupForm />
                <p className="auth-switch">
                  Already have an account?{' '}
                  <button className="link-btn" onClick={() => setCurrentView('login')}>
                    Login
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <nav className="premium-navbar">
            <div className="container-fluid">
              <div className="navbar-content">
                <span className="navbar-brand-premium">
                  📅 Event Management <span className="role-badge">{user.role.toUpperCase()}</span>
                </span>
                <div className="navbar-actions">
                  <span className="user-info">👤 {user.name}</span>
                  <button className="btn-logout" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <div className="main-content">
            {user.role === 'student' && <DashboardStudent user={user} />}
            {(user.role === 'coordinator' || user.role === 'admin') && (
              <DashboardCoordinator user={user} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
