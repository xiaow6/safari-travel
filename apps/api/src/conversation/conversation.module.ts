import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { AgentModule } from '../agent/agent.module';

@Module({
  imports: [AgentModule],
  providers: [ConversationService],
  controllers: [ConversationController],
})
export class ConversationModule {}
