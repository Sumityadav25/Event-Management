import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  registrationDate: { type: Date, default: Date.now },
  
  teamName: String,
  teamMembers: [{
    name: String,
    email: String,
    phone: String
  }],
  
  customFieldResponses: mongoose.Schema.Types.Mixed,
  
  // Payment details
  paymentMode: { 
    type: String, 
    enum: ['online', 'offline'], 
    required: true
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected', 'not_required'], 
    default: 'pending' 
  },
  paymentAmount: Number,
  transactionId: String, // UTR/Reference number
  paymentProof: String, // Screenshot URL or base64
  
  // Registration status
  registrationStatus: { 
    type: String, 
    enum: ['pending', 'confirmed', 'rejected', 'cancelled'], 
    default: 'pending' 
  },
  
  // Verification details
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  rejectionReason: String,
  
  status: { 
    type: String, 
    enum: ['registered', 'attended', 'cancelled'], 
    default: 'registered' 
  }
}, { timestamps: true });

export default mongoose.model('Registration', registrationSchema);
