import React from 'react';
import axios from 'axios';

const EventList = ({ setSelectedEvent, events, fetchEvents, user }) => {

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://event-management-1-gg05.onrender.com/api/events/${id}`);
      alert('Event deleted!');
      fetchEvents();
    } catch (err) {
      alert('Permission denied or error deleting event');
    }
  };

  const handleRegister = async (eventId) => {
    try {
      const res = await axios.post('https://event-management-1-gg05.onrender.com/api/registration/register', { eventId });
      alert(res.data.message || 'Registered successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div>
      <h2 className="mb-3">Upcoming Events</h2>
      <div className="row">
        {events.map(event => (
          <div className="col-md-4 mb-3" key={event._id}>
            <div className="card h-100 shadow-sm" onClick={() => setSelectedEvent(event)} style={{ cursor: 'pointer' }}>
              <div className="card-body">
                <h5 className="card-title">{event.title}</h5>
                <p className="card-text">{event.description}</p>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Venue:</strong> {event.venue}</p>
                <p><strong>Coordinator:</strong> {event.coordinatorName} ({event.coordinatorPhone})</p>
                {/* Buttons based on Role */}
                <div className="d-flex gap-2 mt-3">
                  {user?.role === 'admin' && (
                    <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(event._id); }}>
                      Delete
                    </button>
                  )}
                  {(user?.role === 'coordinator' || user?.role === 'admin') && (
                    <button className="btn btn-warning btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}>
                      Edit
                    </button>
                  )}
                  {user?.role === 'student' && (
                    <button className="btn btn-success btn-sm" onClick={(e) => { e.stopPropagation(); handleRegister(event._id); }}>
                      Register
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;
