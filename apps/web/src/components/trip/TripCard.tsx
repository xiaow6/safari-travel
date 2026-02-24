'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface TripCardProps {
  plan: {
    id: string;
    destination: string;
    departureCity: string;
    startDate: string;
    endDate: string;
    totalEstimate: number;
    currency: string;
    flights: any[];
    hotels: any[];
    carRentals: any[];
    status: string;
  };
}

export default function TripCard({ plan }: TripCardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('flights');
  const [bookingStatus, setBookingStatus] = useState<Record<string, string>>({});

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: plan.currency || 'ZAR',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const handleBook = async (type: string, optionId: string) => {
    setBookingStatus((prev) => ({ ...prev, [optionId]: 'booking' }));
    try {
      await api.createBooking({
        tripPlanId: plan.id,
        type,
        selectedOptionId: optionId,
      });
      setBookingStatus((prev) => ({ ...prev, [optionId]: 'confirmed' }));
    } catch {
      setBookingStatus((prev) => ({ ...prev, [optionId]: 'failed' }));
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const flights = plan.flights || [];
  const hotels = plan.hotels || [];
  const carRentals = plan.carRentals || [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">
              {plan.departureCity} → {plan.destination}
            </h3>
            <p className="text-primary-100 text-sm">
              {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-200">Estimated Total</p>
            <p className="text-xl font-bold">{formatPrice(plan.totalEstimate)}</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="divide-y divide-gray-100">
        {/* Flights */}
        {flights.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('flights')}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Flights ({flights.length} options)
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === 'flights' ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === 'flights' && (
              <div className="px-4 pb-3 space-y-2">
                {flights.map((flight: any) => (
                  <div
                    key={flight.id}
                    className={`border rounded-lg p-3 flex items-center justify-between ${
                      flight.policyCompliant ? 'border-gray-200' : 'border-amber-300 bg-amber-50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{flight.airline}</span>
                        <span className="text-xs text-gray-500">{flight.flightNumber}</span>
                        {!flight.policyCompliant && (
                          <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">
                            Over budget
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {flight.departure?.airport} → {flight.arrival?.airport} · {flight.duration}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm">{formatPrice(flight.price)}</span>
                      <BookButton
                        status={bookingStatus[flight.id]}
                        onBook={() => handleBook('FLIGHT', flight.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hotels */}
        {hotels.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('hotels')}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Hotels ({hotels.length} options)
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === 'hotels' ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === 'hotels' && (
              <div className="px-4 pb-3 space-y-2">
                {hotels.map((hotel: any) => (
                  <div
                    key={hotel.id}
                    className={`border rounded-lg p-3 ${
                      hotel.policyCompliant ? 'border-gray-200' : 'border-amber-300 bg-amber-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{hotel.name}</span>
                          <span className="text-xs text-yellow-500">
                            {'★'.repeat(hotel.starRating)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {hotel.address}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {hotel.amenities?.slice(0, 4).map((a: string) => (
                            <span key={a} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-3">
                        <div className="text-right">
                          <p className="font-semibold text-sm">{formatPrice(hotel.pricePerNight)}<span className="text-xs text-gray-500">/night</span></p>
                          <p className="text-xs text-gray-500">Total: {formatPrice(hotel.totalPrice)}</p>
                        </div>
                        <BookButton
                          status={bookingStatus[hotel.id]}
                          onBook={() => handleBook('HOTEL', hotel.id)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Car Rentals */}
        {carRentals.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('cars')}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Car Rentals ({carRentals.length} options)
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === 'cars' ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === 'cars' && (
              <div className="px-4 pb-3 space-y-2">
                {carRentals.map((car: any) => (
                  <div key={car.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{car.vehicleName}</span>
                        <span className="text-xs text-gray-500">{car.provider}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {car.pickupLocation} · {car.vehicleType}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatPrice(car.pricePerDay)}<span className="text-xs text-gray-500">/day</span></p>
                        <p className="text-xs text-gray-500">Total: {formatPrice(car.totalPrice)}</p>
                      </div>
                      <BookButton
                        status={bookingStatus[car.id]}
                        onBook={() => handleBook('CAR_RENTAL', car.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BookButton({ status, onBook }: { status?: string; onBook: () => void }) {
  if (status === 'confirmed') {
    return (
      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium">
        Booked
      </span>
    );
  }
  if (status === 'booking') {
    return (
      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">
        Booking...
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <button onClick={onBook} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-lg hover:bg-red-200">
        Retry
      </button>
    );
  }
  return (
    <button onClick={onBook} className="text-xs btn-primary py-1 px-3">
      Book
    </button>
  );
}
