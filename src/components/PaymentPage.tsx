import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { venuesData } from '../data/artistsData';
import {
  CreditCard,
  Building,
  Users,
  Calendar,
  Clock,
  Info,
} from 'lucide-react';

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const venueId = parseInt(searchParams.get('venue') || '1');
  const venue = venuesData.find((v) => v.id === venueId);
  const [selectedDate, setSelectedDate] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    bookingName: '',
    persons: '1',
    whatsapp: '',
    email: '',
    decoration: 'no',
    slot: '',
  });

  useEffect(() => {
    if (selectedDate && venue) {
      fetchAvailableSlots();
    }
  }, [selectedDate, venue]);

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/slots?venue=${venue?.name}&date=${selectedDate}`);
      const data = await response.json();
      setBookedSlots(data.bookedSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const getAvailableSlots = () => {
    if (!venue) return [];

    const now = new Date();
    const selectedDateTime = selectedDate ? new Date(selectedDate) : now;
    const isToday = selectedDateTime.toDateString() === now.toDateString();

    return venue.slots.filter((slot) => {
      if (bookedSlots.includes(slot)) return false;
      
      if (!isToday) return true;

      const [time] = slot.split(' - ');
      const [hours, minutesWithAmPm] = time.split(':');
      const minutes = minutesWithAmPm.replace(/[ap]m/i, '');
      const ampm = time.toLowerCase().includes('pm') ? 'pm' : 'am';
      let slotHour = parseInt(hours);
      if (ampm === 'pm' && slotHour !== 12) slotHour += 12;
      if (ampm === 'am' && slotHour === 12) slotHour = 0;

      const slotTime = new Date();
      slotTime.setHours(slotHour, parseInt(minutes), 0, 0);

      return slotTime > now;
    });
  };

  const initializeRazorpay = async (orderData: any) => {
    const options = {
      key: orderData.key,
      amount: orderData.order.amount,
      currency: "INR",
      name: "Binge'N Celebration",
      description: "Venue Booking Payment",
      order_id: orderData.order.id,
      handler: async (response: any) => {
        try {
          const verifyResponse = await fetch('http://localhost:5000/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature
            })
          });

          const verifyData = await verifyResponse.json();
          if (verifyData.success) {
            alert('Payment successful! Your booking is confirmed.');
            // Redirect to success page or show success message
          }
        } catch (error) {
          console.error('Payment verification failed:', error);
          alert('Payment verification failed. Please contact support.');
        }
      },
      prefill: {
        name: formData.bookingName,
        email: formData.email,
        contact: formData.whatsapp
      },
      theme: {
        color: "#DB2777"
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue || !selectedDate) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueName: venue.name,
          date: selectedDate,
          slot: formData.slot,
          bookingName: formData.bookingName,
          persons: parseInt(formData.persons),
          whatsapp: formData.whatsapp,
          email: formData.email,
          decoration: formData.decoration === 'yes'
        })
      });

      const data = await response.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      initializeRazorpay(data);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of the component remains the same...
  // (Keep all the existing JSX and UI logic)

  return (
    // Keep the existing JSX structure, just update the form onSubmit handler
    // and add loading state to the submit button
    <div className="min-h-screen bg-gray-900 py-12">
      {/* Existing JSX structure */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full ${
          isLoading 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-pink-600 hover:bg-pink-700'
        } text-white py-3 rounded-lg transition-colors duration-300 font-bold mt-6`}
      >
        {isLoading ? 'Processing...' : 'PROCEED'}
      </button>
    </div>
  );
};

export default PaymentPage;