import { Injectable } from '@nestjs/common';
import { TripPlannerAgent } from './trip-planner.agent';

export interface AgentResponse {
  content: string;
  metadata?: Record<string, unknown>;
  tripPlan?: {
    destination: string;
    departureCity: string;
    startDate: string;
    endDate: string;
    purpose?: string;
    budget?: number;
    currency?: string;
    flights?: unknown[];
    hotels?: unknown[];
    carRentals?: unknown[];
    totalEstimate?: number;
  };
}

@Injectable()
export class AgentService {
  constructor(private tripPlanner: TripPlannerAgent) {}

  async processMessage(
    messages: { role: string; content: string }[],
    companyPolicy?: Record<string, unknown>,
  ): Promise<AgentResponse> {
    return this.tripPlanner.process(messages, companyPolicy);
  }
}
