import React from 'react';

const CoordinatorEventForm = ({ 
  form, 
  setForm, 
  editingId, 
  setEditingId,
  handleSubmit,
  resetForm 
}) => {
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm({
        ...form,
        [parent]: {
          ...form[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const addCoordinator = () => {
    setForm({
      ...form,
      coordinators: [...form.coordinators, { name: '', phone: '', email: '' }]
    });
  };

  const updateCoordinator = (index, field, value) => {
    const updatedCoordinators = [...form.coordinators];
    updatedCoordinators[index][field] = value;
    setForm({ ...form, coordinators: updatedCoordinators });
  };

  const removeCoordinator = (index) => {
    const updatedCoordinators = form.coordinators.filter((_, i) => i !== index);
    setForm({ ...form, coordinators: updatedCoordinators });
  };

  const addCustomField = () => {
    setForm({
      ...form,
      customFields: [...form.customFields, { fieldName: '', fieldType: 'text', required: false, options: [] }]
    });
  };

  const updateCustomField = (index, field, value) => {
    const updatedFields = [...form.customFields];
    updatedFields[index][field] = value;
    setForm({ ...form, customFields: updatedFields });
  };

  const removeCustomField = (index) => {
    const updatedFields = form.customFields.filter((_, i) => i !== index);
    setForm({ ...form, customFields: updatedFields });
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 mb-4">
      <h3>{editingId ? '✏️ Edit Event' : '➕ Create New Event'}</h3>
      
      {/* Basic Details */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Event Title *</label>
          <input className="form-control" name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Category *</label>
          <select className="form-control" name="category" value={form.category} onChange={handleChange}>
            <option value="Technical">Technical</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows="3" />
      </div>

      <div className="row">
        <div className="col-md-4 mb-3">
          <label className="form-label">Date *</label>
          <input className="form-control" type="date" name="date" value={form.date} onChange={handleChange} required />
        </div>
        <div className="col-md-4 mb-3">
          <label className="form-label">Venue</label>
          <input className="form-control" name="venue" value={form.venue} onChange={handleChange} />
        </div>
        <div className="col-md-4 mb-3">
          <label className="form-label">Max Capacity *</label>
          <input className="form-control" type="number" name="maxCapacity" value={form.maxCapacity} onChange={handleChange} min="1" required />
        </div>
      </div>

      <div className="row">
        <div className="col-md-4 mb-3">
          <label className="form-label">Min Team Size</label>
          <input className="form-control" type="number" name="teamSize.min" value={form.teamSize.min} onChange={handleChange} min="1" />
        </div>
        <div className="col-md-4 mb-3">
          <label className="form-label">Max Team Size</label>
          <input className="form-control" type="number" name="teamSize.max" value={form.teamSize.max} onChange={handleChange} min="1" />
        </div>
        <div className="col-md-4 mb-3">
          <label className="form-label">Entry Fees (₹)</label>
          <input className="form-control" type="number" name="entryFees" value={form.entryFees} onChange={handleChange} min="0" />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Event Image URL</label>
        <input className="form-control" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" />
      </div>

      {/* Payment Details */}
      {form.entryFees > 0 && (
        <div className="card p-3 mb-3 bg-light">
          <h5>💳 Payment Details</h5>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">UPI ID *</label>
              <input
                className="form-control"
                value={form.paymentDetails?.upiId || ''}
                onChange={(e) => setForm({ ...form, paymentDetails: { ...form.paymentDetails, upiId: e.target.value }})}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">UPI Name *</label>
              <input
                className="form-control"
                value={form.paymentDetails?.upiName || ''}
                onChange={(e) => setForm({ ...form, paymentDetails: { ...form.paymentDetails, upiName: e.target.value }})}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">QR Code URL</label>
            <input
              className="form-control"
              value={form.paymentDetails?.qrCodeUrl || ''}
              onChange={(e) => setForm({ ...form, paymentDetails: { ...form.paymentDetails, qrCodeUrl: e.target.value }})}
            />
          </div>
          <div className="row">
            <div className="col-md-6">
              <label>
                <input type="checkbox" checked={form.paymentDetails?.acceptOnlinePayment !== false} 
                  onChange={(e) => setForm({ ...form, paymentDetails: { ...form.paymentDetails, acceptOnlinePayment: e.target.checked }})} />
                {' '}Accept Online
              </label>
            </div>
            <div className="col-md-6">
              <label>
                <input type="checkbox" checked={form.paymentDetails?.acceptOfflinePayment !== false}
                  onChange={(e) => setForm({ ...form, paymentDetails: { ...form.paymentDetails, acceptOfflinePayment: e.target.checked }})} />
                {' '}Accept Offline
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Coordinators */}
      <div className="mb-3">
        <div className="d-flex justify-content-between mb-2">
          <label className="form-label mb-0"><strong>👥 Coordinators *</strong></label>
          <button type="button" className="btn btn-sm btn-success" onClick={addCoordinator}>+ Add</button>
        </div>
        {form.coordinators.map((coord, index) => (
          <div key={index} className="card p-2 mb-2">
            <div className="row">
              <div className="col-md-4">
                <input className="form-control form-control-sm" placeholder="Name *" value={coord.name} 
                  onChange={(e) => updateCoordinator(index, 'name', e.target.value)} required />
              </div>
              <div className="col-md-3">
                <input className="form-control form-control-sm" placeholder="Phone *" value={coord.phone}
                  onChange={(e) => updateCoordinator(index, 'phone', e.target.value)} required />
              </div>
              <div className="col-md-4">
                <input className="form-control form-control-sm" type="email" placeholder="Email *" value={coord.email}
                  onChange={(e) => updateCoordinator(index, 'email', e.target.value)} required />
              </div>
              <div className="col-md-1">
                {form.coordinators.length > 1 && (
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => removeCoordinator(index)}>✕</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Fields */}
      <div className="mb-3">
        <div className="d-flex justify-content-between mb-2">
          <label className="form-label mb-0"><strong>📝 Custom Fields</strong></label>
          <button type="button" className="btn btn-sm btn-info" onClick={addCustomField}>+ Add Field</button>
        </div>
        {form.customFields.map((field, index) => (
          <div key={index} className="card p-2 mb-2">
            <div className="row">
              <div className="col-md-4">
                <input className="form-control form-control-sm" placeholder="Field Name" value={field.fieldName}
                  onChange={(e) => updateCustomField(index, 'fieldName', e.target.value)} />
              </div>
              <div className="col-md-3">
                <select className="form-control form-control-sm" value={field.fieldType}
                  onChange={(e) => updateCustomField(index, 'fieldType', e.target.value)}>
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="email">Email</option>
                  <option value="tel">Phone</option>
                  <option value="textarea">Textarea</option>
                </select>
              </div>
              <div className="col-md-2">
                <label>
                  <input type="checkbox" checked={field.required}
                    onChange={(e) => updateCustomField(index, 'required', e.target.checked)} />
                  {' '}Required
                </label>
              </div>
              <div className="col-md-2">
                <button type="button" className="btn btn-sm btn-danger" onClick={() => removeCustomField(index)}>✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" type="submit">
        {editingId ? '✓ Update' : '+ Create'}
      </button>
      {editingId && (
        <button className="btn btn-secondary ms-2" type="button" onClick={() => { setEditingId(null); resetForm(); }}>
          Cancel
        </button>
      )}
    </form>
  );
};

export default CoordinatorEventForm;
