import { Injectable } from '@nestjs/common';

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

@Injectable()
export class MockSupplierService {
  private readonly airlines = [
    { name: 'FlySafair', code: 'FA' },
    { name: 'Kulula', code: 'MN' },
    { name: 'SAA', code: 'SA' },
    { name: 'Airlink', code: '4Z' },
    { name: 'LIFT', code: 'GE' },
  ];

  private readonly hotels: Record<string, Array<{ name: string; stars: number; basePrice: number; area: string }>> = {
    'Cape Town': [
      { name: 'Protea Hotel Cape Town Waterfront', stars: 4, basePrice: 2200, area: 'V&A Waterfront' },
      { name: 'City Lodge Hotel V&A Waterfront', stars: 3, basePrice: 1400, area: 'V&A Waterfront' },
      { name: 'Tsogo Sun Cape Sun', stars: 4, basePrice: 1800, area: 'City Centre' },
      { name: 'Southern Sun Waterfront Cape Town', stars: 4, basePrice: 2500, area: 'Foreshore' },
      { name: 'StayEasy Cape Town City Bowl', stars: 2, basePrice: 900, area: 'City Bowl' },
    ],
    'Johannesburg': [
      { name: 'Protea Hotel Wanderers', stars: 4, basePrice: 1900, area: 'Illovo' },
      { name: 'City Lodge Hotel Sandton', stars: 3, basePrice: 1300, area: 'Sandton' },
      { name: 'Tsogo Sun Sandton', stars: 5, basePrice: 3200, area: 'Sandton' },
      { name: 'Garden Court OR Tambo', stars: 3, basePrice: 1100, area: 'Kempton Park' },
      { name: 'SunSquare Montecasino', stars: 4, basePrice: 1700, area: 'Fourways' },
    ],
    'Durban': [
      { name: 'Protea Hotel Durban Umhlanga', stars: 4, basePrice: 1800, area: 'Umhlanga' },
      { name: 'City Lodge Hotel Durban', stars: 3, basePrice: 1200, area: 'City Centre' },
      { name: 'Southern Sun Elangeni & Maharani', stars: 4, basePrice: 2000, area: 'Golden Mile' },
      { name: 'Garden Court South Beach', stars: 3, basePrice: 1400, area: 'South Beach' },
    ],
    'Pretoria': [
      { name: 'Protea Hotel Hatfield', stars: 3, basePrice: 1100, area: 'Hatfield' },
      { name: 'City Lodge Hotel Lynnwood', stars: 3, basePrice: 1000, area: 'Lynnwood' },
      { name: 'Southern Sun Pretoria', stars: 4, basePrice: 1600, area: 'Arcadia' },
    ],
  };

  private readonly carProviders = [
    { name: 'Avis', types: ['economy', 'compact', 'midsize', 'suv', 'luxury'] },
    { name: 'Europcar', types: ['economy', 'compact', 'midsize', 'suv'] },
    { name: 'Hertz', types: ['economy', 'compact', 'midsize', 'suv', 'luxury'] },
    { name: 'First Car Rental', types: ['economy', 'compact', 'midsize'] },
  ];

  private readonly carModels: Record<string, { name: string; pricePerDay: number }[]> = {
    economy: [
      { name: 'VW Polo Vivo', pricePerDay: 350 },
      { name: 'Toyota Starlet', pricePerDay: 320 },
    ],
    compact: [
      { name: 'VW Polo', pricePerDay: 450 },
      { name: 'Toyota Corolla Quest', pricePerDay: 420 },
    ],
    midsize: [
      { name: 'Toyota Corolla', pricePerDay: 550 },
      { name: 'Hyundai Elantra', pricePerDay: 520 },
    ],
    suv: [
      { name: 'Toyota Fortuner', pricePerDay: 850 },
      { name: 'Ford Everest', pricePerDay: 900 },
    ],
    luxury: [
      { name: 'BMW 3 Series', pricePerDay: 1200 },
      { name: 'Mercedes-Benz C-Class', pricePerDay: 1300 },
    ],
  };

  private readonly safetyData: Record<string, { level: string; tips: string[] }> = {
    'Johannesburg': {
      level: 'MEDIUM',
      tips: [
        'Avoid walking alone at night, especially in the CBD',
        'Use ride-hailing apps (Uber/Bolt) instead of hailing taxis',
        'Sandton and Rosebank are generally safe business districts',
        'Keep car doors locked and windows up while driving',
        'Do not display expensive electronics or jewelry in public',
        'OR Tambo airport is well-patrolled but watch belongings in parking areas',
      ],
    },
    'Cape Town': {
      level: 'MEDIUM',
      tips: [
        'V&A Waterfront, City Bowl, and Sea Point are generally safe',
        'Avoid walking alone at night in deserted areas',
        'Use the MyCiTi bus system for safe public transport',
        'Table Mountain area is safe during operating hours',
        'Be cautious in parking areas and do not leave valuables in cars',
        'Some areas of the Cape Flats should be avoided',
      ],
    },
    'Durban': {
      level: 'MEDIUM',
      tips: [
        'The Golden Mile beachfront is patrolled but stay alert',
        'Umhlanga is considered one of the safest areas',
        'Use ride-hailing services for transport',
        'Avoid the CBD after dark',
        'Hotel security is generally good at major chains',
      ],
    },
    'Pretoria': {
      level: 'MEDIUM',
      tips: [
        'Hatfield and Menlo Park are safe for business travelers',
        'The Union Buildings area is well-patrolled',
        'Centurion is a safe suburban business hub',
        'Use secure parking at all times',
        'Stick to main roads when driving',
      ],
    },
  };

  private readonly airportCodes: Record<string, string> = {
    'Johannesburg': 'JNB',
    'Cape Town': 'CPT',
    'Durban': 'DUR',
    'Pretoria': 'JNB',
    'Port Elizabeth': 'PLZ',
    'Gqeberha': 'PLZ',
    'Bloemfontein': 'BFN',
    'East London': 'ELS',
    'George': 'GRJ',
    'JNB': 'JNB',
    'CPT': 'CPT',
    'DUR': 'DUR',
    'PLZ': 'PLZ',
    'BFN': 'BFN',
  };

  async searchFlights(params: Record<string, unknown>) {
    const origin = params.origin as string;
    const destination = params.destination as string;
    const departureDate = params.departure_date as string;
    const cabinClass = (params.cabin_class as string) || 'ECONOMY';

    const originCode = this.airportCodes[origin] || origin;
    const destCode = this.airportCodes[destination] || destination;

    const flights = [];
    const numFlights = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numFlights; i++) {
      const airline = this.airlines[i % this.airlines.length];
      const departHour = 6 + Math.floor(Math.random() * 14);
      const duration = 1.5 + Math.random() * 1;
      const arriveHour = departHour + Math.floor(duration);
      const arriveMin = Math.floor((duration % 1) * 60);

      const basePrice = cabinClass === 'ECONOMY' ? 1200 + Math.floor(Math.random() * 2000)
        : cabinClass === 'PREMIUM_ECONOMY' ? 2500 + Math.floor(Math.random() * 2000)
        : cabinClass === 'BUSINESS' ? 5000 + Math.floor(Math.random() * 5000)
        : 10000 + Math.floor(Math.random() * 5000);

      flights.push({
        id: `FL-${generateId()}`,
        airline: airline.name,
        flightNumber: `${airline.code}${100 + Math.floor(Math.random() * 900)}`,
        departure: {
          airport: originCode,
          city: origin,
          time: `${departureDate}T${String(departHour).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
        },
        arrival: {
          airport: destCode,
          city: destination,
          time: `${departureDate}T${String(arriveHour).padStart(2, '0')}:${String(arriveMin).padStart(2, '0')}:00`,
        },
        duration: `${Math.floor(duration)}h ${arriveMin}m`,
        price: basePrice,
        currency: 'ZAR',
        cabinClass,
        stops: 0,
        policyCompliant: basePrice <= 15000,
        policyNotes: basePrice > 15000 ? 'Exceeds maximum flight budget of R15,000' : undefined,
      });
    }

    flights.sort((a, b) => a.price - b.price);
    return { flights };
  }

  async searchHotels(params: Record<string, unknown>) {
    const city = params.city as string;
    const checkIn = params.check_in as string;
    const checkOut = params.check_out as string;
    const maxPrice = params.max_price_per_night as number | undefined;

    const cityHotels = this.hotels[city] || this.hotels['Johannesburg'];
    const nights = this.calculateNights(checkIn, checkOut);

    const hotels = cityHotels.map((hotel) => {
      const variance = 0.8 + Math.random() * 0.4;
      const pricePerNight = Math.round(hotel.basePrice * variance);
      const totalPrice = pricePerNight * nights;

      return {
        id: `HT-${generateId()}`,
        name: hotel.name,
        address: `${Math.floor(Math.random() * 200) + 1} ${hotel.area} Road, ${city}`,
        city,
        starRating: hotel.stars,
        pricePerNight,
        totalPrice,
        currency: 'ZAR',
        checkIn,
        checkOut,
        amenities: this.getHotelAmenities(hotel.stars),
        safetyRating: 'HIGH' as const,
        policyCompliant: pricePerNight <= 3000,
        policyNotes: pricePerNight > 3000 ? 'Exceeds maximum nightly rate of R3,000' : undefined,
      };
    });

    if (maxPrice) {
      return { hotels: hotels.filter((h) => h.pricePerNight <= maxPrice) };
    }
    return { hotels };
  }

  async searchCarRentals(params: Record<string, unknown>) {
    const city = params.city as string;
    const pickupDate = params.pickup_date as string;
    const dropoffDate = params.dropoff_date as string;
    const vehicleType = (params.vehicle_type as string) || 'compact';

    const days = this.calculateNights(pickupDate, dropoffDate) || 1;
    const models = this.carModels[vehicleType] || this.carModels['compact'];
    const providers = this.carProviders.filter((p) => p.types.includes(vehicleType));

    const carRentals = [];
    for (const provider of providers) {
      const model = models[Math.floor(Math.random() * models.length)];
      const variance = 0.9 + Math.random() * 0.2;
      const pricePerDay = Math.round(model.pricePerDay * variance);

      carRentals.push({
        id: `CR-${generateId()}`,
        provider: provider.name,
        vehicleType,
        vehicleName: model.name,
        pricePerDay,
        totalPrice: pricePerDay * days,
        currency: 'ZAR',
        pickupLocation: `${city} Airport`,
        dropoffLocation: `${city} Airport`,
        pickupDate,
        dropoffDate,
        features: ['GPS', 'Air Conditioning', 'Automatic', 'Bluetooth'],
        policyCompliant: pricePerDay <= 800,
      });
    }

    carRentals.sort((a, b) => a.totalPrice - b.totalPrice);
    return { carRentals };
  }

  async getSafetyInfo(location: string) {
    const normalizedLocation = Object.keys(this.safetyData).find(
      (key) => key.toLowerCase() === location.toLowerCase(),
    );

    const data = normalizedLocation
      ? this.safetyData[normalizedLocation]
      : {
          level: 'UNKNOWN',
          tips: [
            'Exercise normal precautions',
            'Research the specific area before traveling',
            'Register with your embassy if traveling internationally',
            'Keep emergency numbers saved on your phone',
          ],
        };

    return {
      location,
      safetyLevel: data.level,
      tips: data.tips,
      emergencyNumbers: {
        police: '10111',
        ambulance: '10177',
        fire: '10177',
        fromMobile: '112',
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  private calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  private getHotelAmenities(stars: number): string[] {
    const base = ['Wi-Fi', 'Air Conditioning', 'TV'];
    if (stars >= 3) base.push('Restaurant', 'Room Service', 'Parking');
    if (stars >= 4) base.push('Gym', 'Pool', 'Business Centre', 'Laundry');
    if (stars >= 5) base.push('Spa', 'Concierge', 'Valet Parking', 'Lounge Access');
    return base;
  }
}
