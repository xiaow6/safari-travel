import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsString, IsEnum } from 'class-validator';

class CreateBookingDto {
  @IsString()
  tripPlanId: string;

  @IsEnum(['FLIGHT', 'HOTEL', 'CAR_RENTAL'])
  type: 'FLIGHT' | 'HOTEL' | 'CAR_RENTAL';

  @IsString()
  selectedOptionId: string;
}

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Post()
  create(@Body() dto: CreateBookingDto, @Request() req: any) {
    return this.bookingService.createBooking(req.user.userId, dto);
  }

  @Get()
  list(@Request() req: any) {
    return this.bookingService.getUserBookings(req.user.userId);
  }

  @Get(':id')
  get(@Param('id') id: string, @Request() req: any) {
    return this.bookingService.getBooking(id, req.user.userId);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.bookingService.cancelBooking(id, req.user.userId);
  }
}
