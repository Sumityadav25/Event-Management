import mongoose from 'mongoose';

const coordinatorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true }
}, { _id: false });

const customFieldSchema = new mongoose.Schema({
  fieldName: { type: String, required: true },
  fieldType: { type: String, enum: ['text', 'number', 'email', 'tel', 'select', 'textarea'], default: 'text' },
  required: { type: Boolean, default: false },
  options: [String]
}, { _id: false });

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  venue: String,
  category: { 
    type: String, 
    enum: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other'], 
    default: 'Other' 
  },
  
  coordinators: [coordinatorSchema],
  
  teamSize: { 
    min: { type: Number, default: 1 },
    max: { type: Number, default: 1 }
  },
  entryFees: { type: Number, default: 0 },
  
  // Payment details
  paymentDetails: {
    upiId: String,
    upiName: String,
    qrCodeUrl: String, // Optional: URL to UPI QR code image
    bankDetails: String, // Optional: Bank account details
    acceptOnlinePayment: { type: Boolean, default: true },
    acceptOfflinePayment: { type: Boolean, default: true }
  },
  
  customFields: [customFieldSchema],
  
  maxCapacity: { type: Number, default: 100 },
  currentRegistrations: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], 
    default: 'upcoming' 
  },
  imageUrl: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
