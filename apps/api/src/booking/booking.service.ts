import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function generateRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'ST-';
  for (let i = 0; i < 8; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async createBooking(
    userId: string,
    data: {
      tripPlanId: string;
      type: 'FLIGHT' | 'HOTEL' | 'CAR_RENTAL';
      selectedOptionId: string;
    },
  ) {
    const tripPlan = await this.prisma.tripPlan.findFirst({
      where: { id: data.tripPlanId, userId },
    });

    if (!tripPlan) {
      throw new NotFoundException('Trip plan not found');
    }

    // Find the selected option from trip plan data
    let details: Record<string, unknown> = {};
    let totalAmount = 0;

    const searchIn = (items: any[], id: string) =>
      items.find((item: any) => item.id === id);

    if (data.type === 'FLIGHT') {
      const flights = tripPlan.flights as any[];
      const selected = searchIn(flights, data.selectedOptionId);
      if (!selected) throw new BadRequestException('Flight option not found');
      details = selected;
      totalAmount = selected.price;
    } else if (data.type === 'HOTEL') {
      const hotels = tripPlan.hotels as any[];
      const selected = searchIn(hotels, data.selectedOptionId);
      if (!selected) throw new BadRequestException('Hotel option not found');
      details = selected;
      totalAmount = selected.totalPrice;
    } else if (data.type === 'CAR_RENTAL') {
      const carRentals = tripPlan.carRentals as any[];
      const selected = searchIn(carRentals, data.selectedOptionId);
      if (!selected) throw new BadRequestException('Car rental option not found');
      details = selected;
      totalAmount = selected.totalPrice;
    }

    const booking = await this.prisma.booking.create({
      data: {
        tripPlanId: data.tripPlanId,
        userId,
        type: data.type,
        status: 'CONFIRMED',
        referenceNumber: generateRef(),
        details: details as any,
        totalAmount,
        currency: 'ZAR',
      },
    });

    return booking;
  }

  async getUserBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { tripPlan: true },
    });
  }

  async getBooking(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
      include: { tripPlan: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async cancelBooking(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });
  }
}
