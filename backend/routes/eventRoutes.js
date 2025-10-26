import express from 'express';
import {
  getEvents,
  getEventById,
  addEvent,
  updateEvent,
  deleteEvent,
  getAnalytics
} from '../controllers/eventController.js';
import { verifyToken, verifyRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes FIRST
router.get('/', getEvents);

// Special routes BEFORE :id routes
router.get('/analytics', verifyToken, verifyRole(['admin']), getAnalytics);

// Protected CRUD routes
router.post('/', verifyToken, verifyRole(['coordinator', 'admin']), addEvent);

// :id routes LAST (to avoid conflicts)
router.get('/:id', getEventById);
router.put('/:id', verifyToken, verifyRole(['coordinator', 'admin']), updateEvent);
router.delete('/:id', verifyToken, verifyRole(['coordinator', 'admin']), deleteEvent);

export default router;
