import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/registration/my-registrations');
      setRegistrations(res.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  return (
    <div className="mt-4">
      <h2 className="mb-3">My Registered Events</h2>
      {registrations.length === 0 ? (
        <div className="alert alert-info">You have not registered for any event yet.</div>
      ) : (
        <div className="row">
          {registrations.map(reg => (
            <div className="col-md-4 mb-3" key={reg._id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{reg.eventId.title}</h5>
                  <p>{reg.eventId.description}</p>
                  <p><strong>Date:</strong> {new Date(reg.eventId.date).toLocaleDateString()}</p>
                  <p><strong>Venue:</strong> {reg.eventId.venue}</p>
                  <p><strong>Coordinator:</strong> {reg.eventId.coordinatorName} ({reg.eventId.coordinatorPhone})</p>
                  <p className="text-muted">Registered On: {new Date(reg.registrationDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;
