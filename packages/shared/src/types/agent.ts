export interface TravelPolicy {
  maxFlightBudget: number;
  maxHotelPerNight: number;
  maxCarPerDay: number;
  allowedCabinClasses: string[];
  maxHotelStarRating: number;
  requiresApprovalAbove: number;
  currency: string;
  preferredAirlines?: string[];
  preferredHotelChains?: string[];
}

export const DEFAULT_SA_TRAVEL_POLICY: TravelPolicy = {
  maxFlightBudget: 15000,
  maxHotelPerNight: 3000,
  maxCarPerDay: 800,
  allowedCabinClasses: ['ECONOMY', 'PREMIUM_ECONOMY'],
  maxHotelStarRating: 4,
  requiresApprovalAbove: 20000,
  currency: 'ZAR',
  preferredAirlines: ['FlySafair', 'Kulula', 'SAA', 'Airlink'],
  preferredHotelChains: ['Protea Hotels', 'City Lodge', 'Sun International', 'Tsogo Sun'],
};

export interface SafetyAlert {
  area: string;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  updatedAt: string;
}
