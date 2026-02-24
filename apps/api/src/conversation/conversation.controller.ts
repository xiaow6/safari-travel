import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsString, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  conversationId?: string;
}

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(private conversationService: ConversationService) {}

  @Get()
  list(@Request() req: any) {
    return this.conversationService.listConversations(req.user.userId);
  }

  @Get(':id')
  get(@Param('id') id: string, @Request() req: any) {
    return this.conversationService.getConversation(id, req.user.userId);
  }

  @Post('message')
  sendMessage(@Body() dto: SendMessageDto, @Request() req: any) {
    return this.conversationService.sendMessage(
      req.user.userId,
      dto.content,
      dto.conversationId,
    );
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.conversationService.deleteConversation(id, req.user.userId);
  }
}
