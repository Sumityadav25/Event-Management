import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import CoordinatorEventForm from './CoordinatorEventForm';
import EventRegistrationsView from './EventRegistrationsView';

const DashboardCoordinator = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    category: 'Technical',
    coordinators: [{ name: '', phone: '', email: '' }],
    teamSize: { min: 1, max: 1 },
    entryFees: 0,
    paymentDetails: {
      upiId: '',
      upiName: '',
      qrCodeUrl: '',
      bankDetails: '',
      acceptOnlinePayment: true,
      acceptOfflinePayment: true
    },
    maxCapacity: 100,
    customFields: [],
    imageUrl: ''
  });

  // Fetch events
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('https://event-management-1-gg05.onrender.com/api/events');
      setEvents(res.data);
    } catch (error) {
      toast.error('Failed to load events');
    }
  };

  const fetchEventRegistrations = async (eventId) => {
    try {
      const res = await axios.get(`https://event-management-1-gg05.onrender.com/api/registration/event/${eventId}`);
      setSelectedEvent(events.find(e => e._id === eventId));
      setRegistrations(res.data);
    } catch (error) {
      toast.error('Failed to load registrations');
    }
  };

  // Create or update event
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.coordinators.some(c => !c.name || !c.phone || !c.email)) {
      toast.error('Please fill all coordinator details');
      return;
    }
    try {
      if (editingId) {
        await axios.put(`https://event-management-1-gg05.onrender.com/api/events/${editingId}`, form);
        toast.success('Event updated!');
        setEditingId(null);
      } else {
        await axios.post('https://event-management-1-gg05.onrender.com/api/events', form);
        toast.success('Event created!');
      }
      resetForm();
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save event');
    }
  };

  // Edit event
  const handleEdit = (event) => {
    setForm({
      ...event,
      date: new Date(event.date).toISOString().split('T')[0],
      coordinators: event.coordinators.length > 0 ? event.coordinators : [{ name: '', phone: '', email: '' }],
      paymentDetails: event.paymentDetails || {
        upiId: '',
        upiName: '',
        qrCodeUrl: '',
        bankDetails: '',
        acceptOnlinePayment: true,
        acceptOfflinePayment: true
      }
    });
    setEditingId(event._id);
  };

  // Reset event form
  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      date: '',
      venue: '',
      category: 'Technical',
      coordinators: [{ name: '', phone: '', email: '' }],
      teamSize: { min: 1, max: 1 },
      entryFees: 0,
      paymentDetails: {
        upiId: '',
        upiName: '',
        qrCodeUrl: '',
        bankDetails: '',
        acceptOnlinePayment: true,
        acceptOfflinePayment: true
      },
      maxCapacity: 100,
      customFields: [],
      imageUrl: ''
    });
  };

  // Delete event
  const handleDelete = async (id) => {
    if (window.confirm('Delete this event and all its registrations?')) {
      try {
        await axios.delete(`https://event-management-1-gg05.onrender.com/api/events/${id}`);
        toast.success('Event deleted');
        fetchEvents();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete event');
      }
    }
  };

  // Main render
  // If registration view is open, show that; else show event form and events list
  if (selectedEvent) {
    return (
      <EventRegistrationsView
        selectedEvent={selectedEvent}
        registrations={registrations}
        onBack={() => setSelectedEvent(null)}
        onRefresh={() => fetchEventRegistrations(selectedEvent._id)}
      />
    );
  }

  return (
    <div>
      <h2>Coordinator Dashboard</h2>

      <CoordinatorEventForm
        form={form}
        setForm={setForm}
        editingId={editingId}
        setEditingId={setEditingId}
        handleSubmit={handleSubmit}
        resetForm={resetForm}
      />

      {/* Events Table */}
      <h3>All Events</h3>
      {events.length === 0 ? (
        <div className="alert alert-info">No events created yet. Start by adding one!</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-sm">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Team Size</th>
                <th>Fees</th>
                <th>Registrations</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event._id}>
                  <td>{event.title}</td>
                  <td><span className="badge bg-info">{event.category}</span></td>
                  <td>{new Date(event.date).toLocaleDateString()}</td>
                  <td>{event.teamSize.min === event.teamSize.max ? event.teamSize.min : `${event.teamSize.min}-${event.teamSize.max}`}</td>
                  <td>{event.entryFees > 0 ? `₹${event.entryFees}` : 'Free'}</td>
                  <td>
                    <button className="btn btn-sm btn-link" onClick={() => fetchEventRegistrations(event._id)}>
                      {event.currentRegistrations}/{event.maxCapacity}
                    </button>
                  </td>
                  <td>
                    <span className={`badge bg-${
                      event.status === 'upcoming' ? 'primary' :
                      event.status === 'ongoing' ? 'warning' :
                      event.status === 'completed' ? 'success' : 'secondary'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-warning" onClick={() => handleEdit(event)}>✏️</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(event._id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DashboardCoordinator;
