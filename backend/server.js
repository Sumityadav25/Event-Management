import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

import eventRoutes from './routes/eventRoutes.js';
import authRoutes from './routes/authRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import userRoutes from './routes/userRoutes.js';  // ← Ye line add karo

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('DB Error:', err.message));

app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/users', userRoutes);  // ← Ye line add karo

app.get('/', (req, res) => {
  res.send('Backend running successfully 🚀');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
