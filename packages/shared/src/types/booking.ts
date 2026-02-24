export interface Booking {
  id: string;
  tripPlanId: string;
  userId: string;
  type: BookingType;
  status: BookingStatus;
  referenceNumber: string;
  details: FlightBookingDetails | HotelBookingDetails | CarBookingDetails;
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export enum BookingType {
  FLIGHT = 'FLIGHT',
  HOTEL = 'HOTEL',
  CAR_RENTAL = 'CAR_RENTAL',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export interface FlightBookingDetails {
  flightNumber: string;
  airline: string;
  departure: { airport: string; time: string };
  arrival: { airport: string; time: string };
  passengerName: string;
  cabinClass: string;
}

export interface HotelBookingDetails {
  hotelName: string;
  address: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  guestName: string;
}

export interface CarBookingDetails {
  provider: string;
  vehicleName: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  driverName: string;
}

export interface CreateBookingRequest {
  tripPlanId: string;
  type: BookingType;
  selectedOptionId: string;
}
