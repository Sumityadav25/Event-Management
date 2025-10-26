import React from 'react';

const EventDetail = ({ event }) => {
  if (!event) return <div className="alert alert-info mt-4">Select an event to see details.</div>;

  return (
    <div className="card mt-4">
      <div className="card-body">
        <h2 className="card-title">{event.title}</h2>
        <p className="card-text">{event.description}</p>
        <p className="card-text"><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
        <p className="card-text"><strong>Venue:</strong> {event.venue}</p>
        <p className="card-text"><strong>Category:</strong> {event.category}</p>
        <p className="card-text"><strong>Coordinator:</strong> {event.coordinatorName}</p>
        <p className="card-text"><strong>Contact:</strong> <a href={`tel:${event.coordinatorPhone}`}>{event.coordinatorPhone}</a></p>
        <p className="card-text"><strong>Email:</strong> <a href={`mailto:${event.coordinatorEmail}`}>{event.coordinatorEmail}</a></p>
      </div>
    </div>
  );
};

export default EventDetail;
