export interface FlightOption {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    city: string;
    time: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
  };
  duration: string;
  price: number;
  currency: string;
  cabinClass: CabinClass;
  stops: number;
  policyCompliant: boolean;
  policyNotes?: string;
}

export enum CabinClass {
  ECONOMY = 'ECONOMY',
  PREMIUM_ECONOMY = 'PREMIUM_ECONOMY',
  BUSINESS = 'BUSINESS',
  FIRST = 'FIRST',
}

export interface HotelOption {
  id: string;
  name: string;
  address: string;
  city: string;
  starRating: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  checkIn: string;
  checkOut: string;
  amenities: string[];
  safetyRating: SafetyRating;
  policyCompliant: boolean;
  policyNotes?: string;
  imageUrl?: string;
}

export enum SafetyRating {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface CarRentalOption {
  id: string;
  provider: string;
  vehicleType: string;
  vehicleName: string;
  pricePerDay: number;
  totalPrice: number;
  currency: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  features: string[];
  policyCompliant: boolean;
}

export interface TripPlan {
  id: string;
  conversationId: string;
  userId: string;
  destination: string;
  departureCity: string;
  startDate: string;
  endDate: string;
  purpose: string;
  budget?: number;
  currency: string;
  flights: FlightOption[];
  hotels: HotelOption[];
  carRentals: CarRentalOption[];
  totalEstimate: number;
  status: TripPlanStatus;
  createdAt: string;
}

export enum TripPlanStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  BOOKED = 'BOOKED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
