import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

// Get all events with search and filter
export const getEvents = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (status && status !== 'all') {
      query.status = status;
    }

    const events = await Event.find(query).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single event with registration details
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const registrations = await Registration.find({ eventId: req.params.id })
      .populate('userId', 'name email')
      .sort({ registrationDate: -1 });
    
    res.json({ event, registrations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create event
export const addEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user.userId
    };
    const newEvent = new Event(eventData);
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error('Add Event Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedEvent);
  } catch (err) {
    console.error('Update Event Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Delete event - FIXED VERSION
export const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    console.log('=== DELETE EVENT ===');
    console.log('Event ID received:', eventId);
    console.log('User:', req.user);

    // Validate MongoDB ObjectId format
    if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('ERROR: Invalid MongoDB ObjectId format');
      return res.status(400).json({ message: 'Invalid event ID format' });
    }
    
    // Check if event exists
    const event = await Event.findById(eventId);
    console.log('Event exists:', !!event);
    
    if (!event) {
      console.log('ERROR: Event not found in database');
      return res.status(404).json({ message: 'Event not found' });
    }

    console.log('Found event:', event.title);

    // Delete all registrations
    console.log('Deleting registrations...');
    const deletedRegs = await Registration.deleteMany({ eventId: eventId });
    console.log('Deleted registrations:', deletedRegs.deletedCount);
    
    // Delete the event
    console.log('Deleting event...');
    await Event.findByIdAndDelete(eventId);
    console.log('Event deleted successfully');
    
    res.json({ 
      message: 'Event deleted successfully',
      deletedRegistrations: deletedRegs.deletedCount
    });
  } catch (err) {
    console.error('=== DELETE ERROR ===');
    console.error('Error:', err);
    res.status(500).json({ 
      message: 'Server error: ' + err.message
    });
  }
};


// Get event analytics (for admin)
export const getAnalytics = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const upcomingEvents = await Event.countDocuments({ status: 'upcoming' });
    
    const popularEvents = await Registration.aggregate([
      { $group: { _id: '$eventId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' } },
      { $unwind: '$event' }
    ]);

    const categoryStats = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      totalEvents,
      totalRegistrations,
      upcomingEvents,
      popularEvents,
      categoryStats
    });
  } catch (err) {
    console.error('Analytics Error:', err);
    res.status(500).json({ message: err.message });
  }
};
