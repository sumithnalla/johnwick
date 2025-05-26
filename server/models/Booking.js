import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  venueName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  slot: {
    type: String,
    required: true
  },
  bookingName: {
    type: String,
    required: true
  },
  persons: {
    type: Number,
    required: true
  },
  whatsapp: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  decoration: {
    type: Boolean,
    default: false
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Booking', bookingSchema);