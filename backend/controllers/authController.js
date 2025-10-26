import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
  console.log('Signup Request Body:', req.body);
  const { name, email, password, role, universalPassword } = req.body;

  try {
    // Check if universal password is required and valid
    if (role === 'admin' || role === 'coordinator') {
      const requiredPassword = role === 'admin' 
        ? process.env.ADMIN_PASSWORD 
        : process.env.COORDINATOR_PASSWORD;

      if (!universalPassword) {
        return res.status(400).json({ 
          message: `Universal password is required for ${role} signup` 
        });
      }

      if (universalPassword !== requiredPassword) {
        return res.status(400).json({ 
          message: `Invalid ${role} password. Contact administrator for access.` 
        });
      }
    }

    const existingUser = await User.findOne({ email });
    console.log('User Exists Check:', existingUser);

    if (existingUser) {
      console.log('Email already exists:', email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    console.log('New User Created:', newUser);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'secretkey', 
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: { 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};
