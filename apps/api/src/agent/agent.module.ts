import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { TripPlannerAgent } from './trip-planner.agent';
import { MockSupplierService } from './mock-supplier.service';

@Module({
  providers: [AgentService, TripPlannerAgent, MockSupplierService],
  exports: [AgentService],
})
export class AgentModule {}
