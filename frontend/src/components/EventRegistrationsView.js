import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const EventRegistrationsView = ({ selectedEvent, registrations, onBack, onRefresh }) => {
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);

  const handleVerify = async (regId, action) => {
    const reason = action === 'reject' ? prompt('Rejection reason (optional):') : null;
    try {
      await axios.post(`https://event-management-1-gg05.onrender.com/api/registration/verify/${regId}`, { action, rejectionReason: reason });
      toast.success(action === 'approve' ? 'Confirmed!' : 'Rejected');
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const exportCSV = () => {
    if (!registrations.length) return;
    const csv = [
      ['Name', 'Email', 'Team', 'Payment', 'Status', 'Date'],
      ...registrations.map(r => [
        r.userId?.name, r.userId?.email, r.teamName || 'Solo',
        r.paymentMode, r.registrationStatus,
        new Date(r.registrationDate).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEvent.title}_registrations.csv`;
    a.click();
  };

  const filtered = registrations.filter(r => filter === 'all' || r.registrationStatus === filter);

  return (
    <div>
      <button className="btn btn-secondary mb-3" onClick={onBack}>← Back</button>
      <div className="card">
        <div className="card-body">
          <h3>{selectedEvent.title} - Registrations</h3>
          <p>
            <span className="text-success">✓ {registrations.filter(r => r.registrationStatus === 'confirmed').length}</span> | 
            <span className="text-warning"> ⏳ {registrations.filter(r => r.registrationStatus === 'pending').length}</span> | 
            <span className="text-danger"> ✗ {registrations.filter(r => r.registrationStatus === 'rejected').length}</span>
          </p>
          <button className="btn btn-success btn-sm mb-3" onClick={exportCSV}>📥 CSV</button>
          
          <ul className="nav nav-tabs mb-3">
            {['all', 'pending', 'confirmed', 'rejected'].map(s => (
              <li className="nav-item" key={s}>
                <button className={`nav-link ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                  {s} ({s === 'all' ? registrations.length : registrations.filter(r => r.registrationStatus === s).length})
                </button>
              </li>
            ))}
          </ul>

          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Email</th><th>Team</th><th>Payment</th><th>Status</th><th>Proof</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r._id}>
                    <td>{i + 1}</td>
                    <td>{r.userId?.name}</td>
                    <td>{r.userId?.email}</td>
                    <td>{r.teamName || 'Solo'}</td>
                    <td><span className={`badge bg-${r.paymentMode === 'online' ? 'primary' : 'secondary'}`}>{r.paymentMode}</span></td>
                    <td><span className={`badge bg-${r.registrationStatus === 'confirmed' ? 'success' : r.registrationStatus === 'pending' ? 'warning' : 'danger'}`}>{r.registrationStatus}</span></td>
                    <td>
                      {r.paymentProof || r.transactionId ? (
                        <button className="btn btn-sm btn-link" onClick={() => { setSelectedProof(r); setShowModal(true); }}>🖼️</button>
                      ) : 'N/A'}
                    </td>
                    <td>
                      {r.registrationStatus === 'pending' && (
                        <>
                          <button className="btn btn-success btn-sm me-1" onClick={() => handleVerify(r._id, 'approve')}>✓</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleVerify(r._id, 'reject')}>✗</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showModal && selectedProof && (
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5>Payment Proof</h5>
                    <button className="btn-close" onClick={() => setShowModal(false)}></button>
                  </div>
                  <div className="modal-body text-center">
                    {selectedProof.transactionId && <p><strong>UTR:</strong> {selectedProof.transactionId}</p>}
                    {selectedProof.paymentProof && <img src={selectedProof.paymentProof} alt="Proof" style={{ maxWidth: '100%' }} />}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationsView;
