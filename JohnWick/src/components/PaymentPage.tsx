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

  const [formData, setFormData] = useState({
    bookingName: '',
    persons: '1',
    whatsapp: '',
    email: '',
    decoration: 'no',
    slot: '',
  });

  useEffect(() => {
    if (selectedDate && getAvailableSlots().length > 0 && !formData.slot) {
      setFormData({ ...formData, slot: getAvailableSlots()[0] });
    }
  }, [selectedDate]);

  const getAvailableSlots = () => {
    if (!venue) return [];

    const now = new Date();
    const selectedDateTime = selectedDate ? new Date(selectedDate) : now;
    const isToday = selectedDateTime.toDateString() === now.toDateString();

    return venue.slots.filter((slot) => {
      if (!isToday) return true;

      const [time] = slot.split(' - ');
      const hours = parseInt(time.split(':')[0]);
      const minutes = parseInt(time.split(':')[1]);

      const ampm = time.toLowerCase().includes('pm') ? 'pm' : 'am';
      let slotHour = hours % 12;
      if (ampm === 'pm') slotHour += 12;

      const slotTime = new Date();
      slotTime.setHours(slotHour, minutes, 0, 0);

      return slotTime > now;
    });
  };

  if (!venue) return <div>Venue not found</div>;

  const basePrice = parseInt(venue.price.replace(/[^\d]/g, ''));
  const decorationFee =
    formData.decoration === 'yes'
      ? parseInt(venue.decorationFee.replace(/[^\d]/g, ''))
      : 0;
  const advanceAmount = 500;
  const balanceAmount = basePrice + decorationFee - advanceAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Processing payment...', { formData, advanceAmount });
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Building className="h-8 w-8 text-pink-500" />
            <h1 className="text-3xl font-bold text-white">
              Complete Your Booking
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold text-white mb-6">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-pink-500" />
                    <div>
                      <p className="text-gray-400 text-sm">Venue</p>
                      <p className="text-white font-medium">{venue.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-pink-500" />
                    <div>
                      <p className="text-gray-400 text-sm">Date</p>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="bg-transparent text-white font-medium focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-pink-500" />
                    <div>
                      <p className="text-gray-400 text-sm">Slot</p>
                      <select
                        value={formData.slot}
                        onChange={(e) =>
                          setFormData({ ...formData, slot: e.target.value })
                        }
                        className="bg-transparent text-white font-medium focus:outline-none"
                      >
                        <option value="">Select a slot</option>
                        {getAvailableSlots().map((slot) => (
                          <option
                            key={slot}
                            value={slot}
                            className="bg-gray-800"
                          >
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="bg-gray-800 rounded-xl p-6"
              >
                <h2 className="text-xl font-bold text-white mb-6">
                  Booking Details
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Booking Name*
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.bookingName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bookingName: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white"
                      placeholder="Enter booking name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Number of Persons*
                    </label>
                    <select
                      required
                      value={formData.persons}
                      onChange={(e) =>
                        setFormData({ ...formData, persons: e.target.value })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white"
                    >
                      {[...Array(venue.baseMembers)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} Person{i !== 0 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      WhatsApp Number*
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white"
                      placeholder="Enter WhatsApp number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email ID*
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Do you want decoration?*
                    </label>
                    <select
                      required
                      value={formData.decoration}
                      onChange={(e) =>
                        setFormData({ ...formData, decoration: e.target.value })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg transition-colors duration-300 font-bold mt-6"
                >
                  PROCEED
                </button>
              </form>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl p-6 sticky top-6">
                <h2 className="text-xl font-bold text-white mb-6">
                  Booking Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Base Price</span>
                    <span className="text-white font-medium">₹{basePrice}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Decoration</span>
                    <span className="text-white font-medium">
                      ₹{decorationFee}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">
                      Advance Amount Payable
                    </span>
                    <div className="text-right">
                      <span className="text-white font-medium">
                        ₹{advanceAmount}
                      </span>
                      <p className="text-xs text-gray-400">
                        (Including ₹50/- convenience fee)
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300">Balance Amount</span>
                      <div className="group relative">
                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-700 text-xs text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Final amount can be negotiated directly with the venue
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-medium">
                        ₹{balanceAmount}
                      </span>
                      <p className="text-xs text-gray-400">
                        (Final amount negotiable — to be paid at venue)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
