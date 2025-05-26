import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import Booking from './models/Booking.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Get available slots for a venue and date
app.get('/api/slots', async (req, res) => {
  try {
    const { venue, date } = req.query;
    const bookings = await Booking.find({
      venueName: venue,
      date: new Date(date),
      paymentStatus: 'completed'
    });

    const bookedSlots = bookings.map(booking => booking.slot);
    res.json({ bookedSlots });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const booking = new Booking(req.body);
    
    // Check if slot is available
    const existingBooking = await Booking.findOne({
      venueName: req.body.venueName,
      date: req.body.date,
      slot: req.body.slot,
      paymentStatus: 'completed'
    });

    if (existingBooking) {
      return res.status(400).json({ error: 'Slot already booked' });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: 50000, // ₹500 in paise
      currency: 'INR',
      receipt: `booking_${Date.now()}`
    });

    booking.razorpayOrderId = order.id;
    await booking.save();

    res.json({ 
      booking,
      order,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify payment
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
    
    // Verify payment signature here
    // Update booking status
    await Booking.findOneAndUpdate(
      { razorpayOrderId },
      { 
        paymentStatus: 'completed',
        razorpayPaymentId
      }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});