import Registration from '../models/Registration.js';
import Event from '../models/Event.js';

// Register for event (registration stays pending until verified)
export const registerForEvent = async (req, res) => {
  const { eventId, teamName, teamMembers, customFieldResponses, paymentMode, transactionId, paymentProof } = req.body;
  const userId = req.user.userId;

  try {
    const existing = await Registration.findOne({ eventId, userId });
    if (existing) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.currentRegistrations >= event.maxCapacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    if (event.status !== 'upcoming') {
      return res.status(400).json({ message: 'Cannot register for this event' });
    }

    // Validate team size
    const teamSize = teamMembers ? teamMembers.length + 1 : 1;
    if (teamSize < event.teamSize.min || teamSize > event.teamSize.max) {
      return res.status(400).json({ 
        message: `Team size must be between ${event.teamSize.min} and ${event.teamSize.max}` 
      });
    }

    // Validate payment mode
    if (event.entryFees > 0) {
      if (paymentMode === 'online' && !event.paymentDetails?.acceptOnlinePayment) {
        return res.status(400).json({ message: 'Online payment not available for this event' });
      }
      if (paymentMode === 'offline' && !event.paymentDetails?.acceptOfflinePayment) {
        return res.status(400).json({ message: 'Offline payment not available for this event' });
      }
      
      // Online payment requires transaction ID and proof
      if (paymentMode === 'online' && (!transactionId || !paymentProof)) {
        return res.status(400).json({ message: 'Transaction ID and payment proof are required for online payment' });
      }
    }

    // Determine payment and registration status
    let paymentStatus = 'not_required';
    let registrationStatus = 'confirmed'; // Default for free events
    
    if (event.entryFees > 0) {
      paymentStatus = 'pending'; // Always pending until coordinator verifies
      registrationStatus = 'pending'; // Wait for payment verification
    }

    const newReg = new Registration({ 
      eventId, 
      userId,
      teamName,
      teamMembers,
      customFieldResponses,
      paymentMode: event.entryFees > 0 ? paymentMode : undefined,
      paymentAmount: event.entryFees,
      paymentStatus,
      registrationStatus,
      transactionId: transactionId || null,
      paymentProof: paymentProof || null
    });
    await newReg.save();

    // DON'T increment currentRegistrations yet - wait for verification
    // event.currentRegistrations += 1;
    // await event.save();

    res.status(201).json({ 
      message: event.entryFees > 0 
        ? 'Registration submitted! Waiting for payment verification by coordinator.' 
        : 'Registration confirmed!',
      registration: newReg,
      requiresVerification: event.entryFees > 0
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get user's registrations
export const getMyRegistrations = async (req, res) => {
  const userId = req.user.userId;
  try {
    const registrations = await Registration.find({ userId })
      .populate('eventId')
      .sort({ registrationDate: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel registration
export const cancelRegistration = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const registration = await Registration.findOne({ _id: id, userId });
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // If already confirmed, decrement event capacity
    if (registration.registrationStatus === 'confirmed') {
      const event = await Event.findById(registration.eventId);
      if (event) {
        event.currentRegistrations = Math.max(0, event.currentRegistrations - 1);
        await event.save();
      }
    }

    await Registration.findByIdAndDelete(id);
    res.json({ message: 'Registration cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get registrations for an event (Coordinator/Admin only)
export const getEventRegistrations = async (req, res) => {
  const { eventId } = req.params;
  try {
    const registrations = await Registration.find({ eventId })
      .populate('userId', 'name email phone department')
      .sort({ registrationDate: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify payment and confirm registration (Coordinator/Admin only)
export const verifyRegistration = async (req, res) => {
  const { id } = req.params;
  const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'
  const coordinatorId = req.user.userId;

  try {
    const registration = await Registration.findById(id).populate('eventId');
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const event = registration.eventId;

    if (action === 'approve') {
      // Check if event still has capacity
      if (event.currentRegistrations >= event.maxCapacity) {
        return res.status(400).json({ message: 'Event capacity is full' });
      }

      registration.paymentStatus = 'verified';
      registration.registrationStatus = 'confirmed';
      registration.verifiedBy = coordinatorId;
      registration.verifiedAt = new Date();
      await registration.save();

      // NOW increment the event capacity
      event.currentRegistrations += 1;
      await event.save();

      res.json({ message: 'Registration confirmed successfully', registration });
    } else if (action === 'reject') {
      registration.paymentStatus = 'rejected';
      registration.registrationStatus = 'rejected';
      registration.rejectionReason = rejectionReason || 'Payment verification failed';
      registration.verifiedBy = coordinatorId;
      registration.verifiedAt = new Date();
      await registration.save();

      res.json({ message: 'Registration rejected', registration });
    } else {
      res.status(400).json({ message: 'Invalid action. Use "approve" or "reject"' });
    }
  } catch (err) {
    console.error('Verify Registration Error:', err);
    res.status(500).json({ message: err.message });
  }
};
