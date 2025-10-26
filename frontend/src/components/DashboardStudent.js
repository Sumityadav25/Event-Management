import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DashboardStudent = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showProfile, setShowProfile] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchMyRegistrations();
  }, [search, category]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/events', {
        params: { search, category: category !== 'all' ? category : undefined, status: 'upcoming' }
      });
      setEvents(res.data);
    } catch (error) {
      toast.error('Failed to load events');
    }
  };

  const fetchMyRegistrations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/registration/my-registrations');
      setMyRegistrations(res.data);
    } catch (error) {
      toast.error('Failed to load registrations');
    }
  };

  const handleCancelRegistration = async (regId) => {
    if (window.confirm('Are you sure you want to cancel this registration?')) {
      try {
        await axios.delete(`http://localhost:5000/api/registration/${regId}`);
        toast.success('Registration cancelled');
        fetchMyRegistrations();
        fetchEvents();
      } catch (error) {
        toast.error('Failed to cancel registration');
      }
    }
  };

  const isRegistered = (eventId) => {
    return myRegistrations.some(reg => reg.eventId?._id === eventId);
  };

  const openRegistrationForm = (event) => {
    setSelectedEvent(event);
    setShowRegistrationForm(true);
  };

  if (showProfile) {
    return <UserProfile user={user} setShowProfile={setShowProfile} />;
  }

  if (showRegistrationForm && selectedEvent) {
    return (
      <RegistrationForm
        event={selectedEvent}
        onClose={() => {
          setShowRegistrationForm(false);
          setSelectedEvent(null);
        }}
        onSuccess={() => {
          fetchMyRegistrations();
          fetchEvents();
          setShowRegistrationForm(false);
          setSelectedEvent(null);
        }}
      />
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Student Dashboard</h2>
        <button className="btn btn-outline-primary" onClick={() => setShowProfile(true)}>
          👤 My Profile
        </button>
      </div>

      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-8">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Available Events */}
      <h3 className="mt-4">📅 Available Events</h3>
      <div className="row">
        {events.map((event) => {
          const isFull = event.currentRegistrations >= event.maxCapacity;
          const registered = isRegistered(event._id);
          
          return (
            <div key={event._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                {event.imageUrl && (
                  <img 
                    src={event.imageUrl} 
                    className="card-img-top" 
                    alt={event.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{event.title}</h5>
                    <span className="badge bg-info">{event.category}</span>
                  </div>
                  
                  <p className="card-text text-muted small">{event.description}</p>
                  
                  <div className="mb-2">
                    <small className="text-muted">
                      <strong>📅 Date:</strong> {new Date(event.date).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </small>
                  </div>
                  
                  <div className="mb-2">
                    <small className="text-muted">
                      <strong>📍 Venue:</strong> {event.venue}
                    </small>
                  </div>

                  <div className="mb-2">
                    <small className="text-muted">
                      <strong>👥 Team Size:</strong> {
                        event.teamSize.min === event.teamSize.max 
                          ? event.teamSize.min 
                          : `${event.teamSize.min}-${event.teamSize.max}`
                      } {event.teamSize.max > 1 ? 'members' : 'member'}
                    </small>
                  </div>

                  {event.entryFees > 0 && (
                    <div className="mb-2">
                      <small className="text-muted">
                        <strong>💰 Entry Fees:</strong> ₹{event.entryFees}
                      </small>
                    </div>
                  )}

                  <div className="mb-3">
                    <small className="text-muted">
                      <strong>🎫 Capacity:</strong> {event.currentRegistrations}/{event.maxCapacity}
                      {isFull && <span className="badge bg-danger ms-2">FULL</span>}
                    </small>
                  </div>

                  {/* Coordinators */}
                  {event.coordinators && event.coordinators.length > 0 && (
                    <div className="mb-3">
                      <small><strong>📞 Contact:</strong></small>
                      {event.coordinators.map((coord, idx) => (
                        <div key={idx} className="small text-muted ms-2">
                          {coord.name} - {coord.phone}
                        </div>
                      ))}
                    </div>
                  )}

                  {registered ? (
                    <button className="btn btn-success w-100" disabled>
                      ✓ Already Registered
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => openRegistrationForm(event)}
                      disabled={isFull}
                    >
                      {isFull ? '❌ Event Full' : '📝 Register Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className="text-center text-muted py-5">
          <h5>No events found</h5>
          <p>Try different search or filter options</p>
        </div>
      )}

      {/* My Registrations */}
      <h3 className="mt-5">🎟️ My Registrations</h3>
      {myRegistrations.length === 0 ? (
        <div className="alert alert-info">
          You haven't registered for any events yet.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Event</th>
                <th>Category</th>
                <th>Date</th>
                <th>Team Name</th>
                <th>Team Size</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {myRegistrations.map((reg) => (
                <tr key={reg._id}>
                  <td><strong>{reg.eventId?.title}</strong></td>
                  <td><span className="badge bg-info">{reg.eventId?.category}</span></td>
                  <td>{new Date(reg.eventId?.date).toLocaleDateString()}</td>
                  <td>{reg.teamName || 'Solo'}</td>
                  <td>{(reg.teamMembers?.length || 0) + 1}</td>
                  <td>
                    {reg.paymentMode && (
                      <span className={`badge bg-${reg.paymentMode === 'online' ? 'primary' : 'secondary'}`}>
                        {reg.paymentMode === 'online' ? '💸 Online' : '🏪 Offline'}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`badge bg-${
                      reg.registrationStatus === 'confirmed' ? 'success' :
                      reg.registrationStatus === 'pending' ? 'warning' :
                      reg.registrationStatus === 'rejected' ? 'danger' : 'secondary'
                    }`}>
                      {reg.registrationStatus === 'confirmed' ? '✓ Confirmed' :
                       reg.registrationStatus === 'pending' ? '⏳ Pending' :
                       reg.registrationStatus === 'rejected' ? '✗ Rejected' : reg.registrationStatus}
                    </span>
                    {reg.rejectionReason && (
                      <div className="small text-danger mt-1">
                        Reason: {reg.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td>
                    {(reg.registrationStatus === 'pending' || reg.registrationStatus === 'confirmed') && reg.eventId?.status === 'upcoming' && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleCancelRegistration(reg._id)}
                      >
                        Cancel
                      </button>
                    )}
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

// Registration Form Component with Dynamic Fields and Screenshot Upload
const RegistrationForm = ({ event, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    teamName: '',
    teamMembers: [],
    customFieldResponses: {},
    paymentMode: 'offline',
    transactionId: '',
    paymentProof: ''
  });
  const [loading, setLoading] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  useEffect(() => {
    if (event.teamSize.min > 1) {
      const initialMembers = Array(event.teamSize.min - 1).fill(null).map(() => ({
        name: '',
        email: '',
        phone: ''
      }));
      setFormData(prev => ({ ...prev, teamMembers: initialMembers }));
    }
  }, [event.teamSize.min]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCustomFieldChange = (fieldName, value) => {
    setFormData({
      ...formData,
      customFieldResponses: {
        ...formData.customFieldResponses,
        [fieldName]: value
      }
    });
  };

  const addTeamMember = () => {
    if (formData.teamMembers.length < event.teamSize.max - 1) {
      setFormData({
        ...formData,
        teamMembers: [...formData.teamMembers, { name: '', email: '', phone: '' }]
      });
    }
  };

  const removeTeamMember = (index) => {
    const updatedMembers = formData.teamMembers.filter((_, i) => i !== index);
    setFormData({ ...formData, teamMembers: updatedMembers });
  };

  const updateTeamMember = (index, field, value) => {
    const updatedMembers = [...formData.teamMembers];
    updatedMembers[index][field] = value;
    setFormData({ ...formData, teamMembers: updatedMembers });
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
        setFormData({ ...formData, paymentProof: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (event.customFields) {
        for (let field of event.customFields) {
          if (field.required && !formData.customFieldResponses[field.fieldName]) {
            toast.error(`${field.fieldName} is required`);
            setLoading(false);
            return;
          }
        }
      }

      if (event.teamSize.min > 1) {
        for (let member of formData.teamMembers) {
          if (!member.name || !member.email || !member.phone) {
            toast.error('Please fill all team member details');
            setLoading(false);
            return;
          }
        }
      }

      if (event.entryFees > 0 && formData.paymentMode === 'online') {
        if (!formData.transactionId) {
          toast.error('Please enter UTR/Transaction ID');
          setLoading(false);
          return;
        }
        if (!formData.paymentProof) {
          toast.error('Please upload payment screenshot');
          setLoading(false);
          return;
        }
      }

      const response = await axios.post('http://localhost:5000/api/registration/register', {
        eventId: event._id,
        ...formData
      });

      toast.success(response.data.message);
      
      if (response.data.requiresVerification) {
        toast.info('Your registration will be confirmed after payment verification', {
          autoClose: 5000
        });
      }

      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button className="btn btn-secondary mb-3" onClick={onClose}>
        ← Back to Events
      </button>

      <div className="card">
        <div className="card-body">
          <h3>Register for {event.title}</h3>
          <p className="text-muted">{event.description}</p>

          <div className="alert alert-info">
            <strong>Event Details:</strong>
            <ul className="mb-0">
              <li>Date: {new Date(event.date).toLocaleDateString()}</li>
              <li>Venue: {event.venue}</li>
              <li>Team Size: {event.teamSize.min === event.teamSize.max ? event.teamSize.min : `${event.teamSize.min}-${event.teamSize.max}`}</li>
              {event.entryFees > 0 && <li className="text-danger"><strong>Entry Fees: ₹{event.entryFees}</strong></li>}
            </ul>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Team Name */}
            {event.teamSize.max > 1 && (
              <div className="mb-3">
                <label className="form-label">Team Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your team name"
                />
              </div>
            )}

            {/* Team Members */}
            {event.teamSize.max > 1 && (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label mb-0">
                    <strong>Team Members</strong> (You + {formData.teamMembers.length})
                  </label>
                  {formData.teamMembers.length < event.teamSize.max - 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-success"
                      onClick={addTeamMember}
                    >
                      + Add Member
                    </button>
                  )}
                </div>

                {formData.teamMembers.map((member, index) => (
                  <div key={index} className="card p-3 mb-2">
                    <div className="d-flex justify-content-between mb-2">
                      <strong>Member {index + 1}</strong>
                      {formData.teamMembers.length > event.teamSize.min - 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => removeTeamMember(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="row">
                      <div className="col-md-4 mb-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Full Name *"
                          value={member.name}
                          onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-4 mb-2">
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Email *"
                          value={member.email}
                          onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-4 mb-2">
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="Phone *"
                          value={member.phone}
                          onChange={(e) => updateTeamMember(index, 'phone', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Custom Fields */}
            {event.customFields && event.customFields.length > 0 && (
              <div className="mb-4">
                <h5>Additional Information</h5>
                {event.customFields.map((field, index) => (
                  <div key={index} className="mb-3">
                    <label className="form-label">
                      {field.fieldName} {field.required && <span className="text-danger">*</span>}
                    </label>
                    
                    {field.fieldType === 'textarea' ? (
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.customFieldResponses[field.fieldName] || ''}
                        onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value)}
                        required={field.required}
                      />
                    ) : field.fieldType === 'select' ? (
                      <select
                        className="form-control"
                        value={formData.customFieldResponses[field.fieldName] || ''}
                        onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value)}
                        required={field.required}
                      >
                        <option value="">Select an option</option>
                        {field.options?.map((option, idx) => (
                          <option key={idx} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.fieldType}
                        className="form-control"
                        value={formData.customFieldResponses[field.fieldName] || ''}
                        onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value)}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Payment Section */}
            {event.entryFees > 0 && (
              <div className="card p-3 mb-4 bg-light">
                <h5 className="mb-3">💳 Payment Details</h5>
                <p className="text-danger"><strong>Entry Fees: ₹{event.entryFees}</strong></p>
                
                <div className="mb-3">
                  <label className="form-label"><strong>Select Payment Mode *</strong></label>
                  <div>
                    {event.paymentDetails?.acceptOnlinePayment && (
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMode"
                          value="online"
                          checked={formData.paymentMode === 'online'}
                          onChange={handleChange}
                        />
                        <label className="form-check-label">
                          💸 Online Payment (UPI) - Complete payment first
                        </label>
                      </div>
                    )}
                    
                    {event.paymentDetails?.acceptOfflinePayment && (
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMode"
                          value="offline"
                          checked={formData.paymentMode === 'offline'}
                          onChange={handleChange}
                        />
                        <label className="form-check-label">
                          🏪 Offline Payment (Pay to coordinator)
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Online Payment Details */}
                {formData.paymentMode === 'online' && (
                  <div className="alert alert-warning">
                    <h6>📱 Step 1: Complete UPI Payment</h6>
                    <p className="mb-2"><strong>UPI ID:</strong> {event.paymentDetails?.upiId}</p>
                    <p className="mb-2"><strong>Name:</strong> {event.paymentDetails?.upiName}</p>
                    
                    {event.paymentDetails?.qrCodeUrl && (
                      <div className="mb-3">
                        <p><strong>Scan QR Code:</strong></p>
                        <img 
                          src={event.paymentDetails.qrCodeUrl} 
                          alt="UPI QR Code" 
                          style={{ maxWidth: '200px' }}
                          className="border"
                        />
                      </div>
                    )}

                    {event.paymentDetails?.bankDetails && (
                      <div className="mb-2">
                        <p><strong>Bank Details:</strong></p>
                        <pre className="small">{event.paymentDetails.bankDetails}</pre>
                      </div>
                    )}

                    <hr />
                    
                    <h6>📝 Step 2: Fill Payment Details</h6>
                    
                    <div className="mb-3">
                      <label className="form-label">UTR / Transaction ID *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="transactionId"
                        value={formData.transactionId}
                        onChange={handleChange}
                        placeholder="Enter 12-digit UTR number"
                        required={formData.paymentMode === 'online'}
                      />
                      <small className="text-muted">Find this in your UPI app transaction details</small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Upload Payment Screenshot *</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        required={formData.paymentMode === 'online' && !formData.paymentProof}
                      />
                      <small className="text-muted">Upload screenshot showing transaction details</small>
                      
                      {screenshotPreview && (
                        <div className="mt-2">
                          <p className="small mb-1"><strong>Preview:</strong></p>
                          <img 
                            src={screenshotPreview} 
                            alt="Payment Screenshot Preview" 
                            style={{ maxWidth: '300px', maxHeight: '200px' }}
                            className="border"
                          />
                        </div>
                      )}
                    </div>

                    <div className="alert alert-info small mb-0">
                      <strong>⚠️ Important:</strong>
                      <ul className="mb-0 mt-2">
                        <li>Complete payment before submitting form</li>
                        <li>Enter correct UTR/Transaction ID</li>
                        <li>Upload clear screenshot of payment confirmation</li>
                        <li><strong>Registration will be PENDING until coordinator verifies payment</strong></li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Offline Payment Details */}
                {formData.paymentMode === 'offline' && (
                  <div className="alert alert-success">
                    <h6>📞 Contact Coordinators for Payment:</h6>
                    {event.coordinators?.map((coord, idx) => (
                      <div key={idx} className="mb-2">
                        <p className="mb-1"><strong>{coord.name}</strong></p>
                        <p className="mb-1">📱 Phone: {coord.phone}</p>
                        <p className="mb-0">📧 Email: {coord.email}</p>
                        {idx < event.coordinators.length - 1 && <hr />}
                      </div>
                    ))}
                    <hr />
                    <div className="alert alert-warning small mb-0">
                      <strong>⚠️ Note:</strong>
                      <ul className="mb-0 mt-2">
                        <li>Your registration will be <strong>PENDING</strong> until you pay</li>
                        <li>Contact coordinator to make payment</li>
                        <li>Coordinator will confirm your registration after receiving payment</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-lg w-100"
              disabled={loading}
            >
              {loading ? 'Submitting...' : event.entryFees > 0 ? '📤 Submit for Verification' : '✓ Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// User Profile Component
const UserProfile = ({ user, setShowProfile }) => {
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    department: '',
    year: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/profile');
      setProfile(res.data);
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/users/profile', profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div>
      <button className="btn btn-secondary mb-3" onClick={() => setShowProfile(false)}>
        ← Back to Dashboard
      </button>
      <div className="card">
        <div className="card-body">
          <h3>My Profile</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={profile.email}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-control"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Department</label>
              <input
                type="text"
                className="form-control"
                value={profile.department || ''}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Year</label>
              <select
                className="form-control"
                value={profile.year || ''}
                onChange={(e) => setProfile({ ...profile, year: e.target.value })}
              >
                <option value="">Select Year</option>
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Update Profile</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardStudent;
