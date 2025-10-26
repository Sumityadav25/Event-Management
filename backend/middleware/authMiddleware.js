import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify JWT token
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('=== TOKEN VERIFICATION ===');
    console.log('Authorization Header:', authHeader);
    
    if (!authHeader) {
      console.log('ERROR: No authorization header');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.log('ERROR: Invalid token format');
      return res.status(401).json({ message: 'Invalid token format. Use Bearer token.' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token extracted:', token ? 'Present' : 'Missing');

    if (!token) {
      console.log('ERROR: Token missing after Bearer');
      return res.status(401).json({ message: 'Access denied. No token.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    console.log('Token decoded successfully:', decoded);
    
    req.user = decoded;
    next();
  } catch (err) {
    console.error('=== TOKEN ERROR ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please login again.' });
    }
    
    res.status(400).json({ message: 'Token verification failed: ' + err.message });
  }
};

// Check role for access
export const verifyRole = (roles) => {
  return (req, res, next) => {
    console.log('=== ROLE VERIFICATION ===');
    console.log('Required roles:', roles);
    console.log('User role:', req.user?.role);
    
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'User role not found' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}` 
      });
    }
    
    console.log('Role verification passed');
    next();
  };
};
