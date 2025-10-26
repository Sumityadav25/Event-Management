import express from 'express';
import {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  getEventRegistrations,
  verifyRegistration
} from '../controllers/registrationController.js';
import { verifyToken, verifyRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', verifyToken, registerForEvent);
router.get('/my-registrations', verifyToken, getMyRegistrations);
router.delete('/:id', verifyToken, cancelRegistration);
router.get('/event/:eventId', verifyToken, verifyRole(['coordinator', 'admin']), getEventRegistrations);
router.post('/verify/:id', verifyToken, verifyRole(['coordinator', 'admin']), verifyRegistration);

export default router;
