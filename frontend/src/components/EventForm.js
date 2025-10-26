import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EventForm = ({ selectedEvent, fetchEvents, clearSelectedEvent }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    category: '',
    coordinatorName: '',
    coordinatorPhone: '',
    coordinatorEmail: ''
  });

  useEffect(() => {
    if (selectedEvent) {
      setForm({
        title: selectedEvent.title,
        description: selectedEvent.description,
        date: selectedEvent.date ? selectedEvent.date.slice(0, 10) : '',
        venue: selectedEvent.venue,
        category: selectedEvent.category,
        coordinatorName: selectedEvent.coordinatorName,
        coordinatorPhone: selectedEvent.coordinatorPhone,
        coordinatorEmail: selectedEvent.coordinatorEmail
      });
    } else {
      setForm({
        title: '',
        description: '',
        date: '',
        venue: '',
        category: '',
        coordinatorName: '',
        coordinatorPhone: '',
        coordinatorEmail: ''
      });
    }
  }, [selectedEvent]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (selectedEvent) {
      axios.put(`https://event-management-1-gg05.onrender.com/api/events/${selectedEvent._id}`, form)
        .then(res => {
          alert('Event updated!');
          fetchEvents();
          clearSelectedEvent();
        })
        .catch(err => alert('Error updating event'));
    } else {
      axios.post('https://event-management-1-gg05.onrender.com/api/events', form)
        .then(res => {
          alert('Event added!');
          fetchEvents();
          setForm({
            title: '',
            description: '',
            date: '',
            venue: '',
            category: '',
            coordinatorName: '',
            coordinatorPhone: '',
            coordinatorEmail: ''
          });
        })
        .catch(err => alert('Error adding event'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded bg-light">
      <h2 className="mb-3">{selectedEvent ? 'Edit Event' : 'Add New Event'}</h2>
      <div className="mb-2">
        <input className="form-control" name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
      </div>
      <div className="mb-2">
        <input className="form-control" name="description" value={form.description} onChange={handleChange} placeholder="Description" />
      </div>
      <div className="mb-2">
        <input className="form-control" name="date" type="date" value={form.date} onChange={handleChange} required />
      </div>
      <div className="mb-2">
        <input className="form-control" name="venue" value={form.venue} onChange={handleChange} placeholder="Venue" />
      </div>
      <div className="mb-2">
        <input className="form-control" name="category" value={form.category} onChange={handleChange} placeholder="Category" />
      </div>
      <div className="mb-2">
        <input className="form-control" name="coordinatorName" value={form.coordinatorName} onChange={handleChange} placeholder="Coordinator Name" required />
      </div>
      <div className="mb-2">
        <input className="form-control" name="coordinatorPhone" value={form.coordinatorPhone} onChange={handleChange} placeholder="Coordinator Phone" required />
      </div>
      <div className="mb-2">
        <input className="form-control" name="coordinatorEmail" value={form.coordinatorEmail} onChange={handleChange} placeholder="Coordinator Email" />
      </div>
      <button className="btn btn-primary me-2" type="submit">{selectedEvent ? 'Update Event' : 'Add Event'}</button>
      {selectedEvent && <button className="btn btn-secondary" type="button" onClick={clearSelectedEvent}>Cancel Edit</button>}
    </form>
  );
};

export default EventForm;
