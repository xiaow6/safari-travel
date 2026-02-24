import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AgentService } from '../agent/agent.service';

@Injectable()
export class ConversationService {
  constructor(
    private prisma: PrismaService,
    private agentService: AgentService,
  ) {}

  async listConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { userId, status: 'ACTIVE' },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async getConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        tripPlans: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async sendMessage(userId: string, content: string, conversationId?: string) {
    // Create or get conversation
    let conversation;
    if (conversationId) {
      conversation = await this.prisma.conversation.findFirst({
        where: { id: conversationId, userId },
      });
      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }
    } else {
      conversation = await this.prisma.conversation.create({
        data: {
          userId,
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        },
      });
    }

    // Save user message
    const userMessage = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content,
      },
    });

    // Get conversation history for context
    const history = await this.prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
    });

    // Get user with company policy
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    // Process with AI Agent
    const agentResponse = await this.agentService.processMessage(
      history.map((m) => ({ role: m.role as 'USER' | 'ASSISTANT' | 'SYSTEM', content: m.content })),
      user?.company?.policy as Record<string, unknown> | undefined,
    );

    // Save assistant message
    const assistantMessage = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: agentResponse.content,
        metadata: (agentResponse.metadata ?? undefined) as any,
      },
    });

    // Save trip plan if generated
    if (agentResponse.tripPlan) {
      await this.prisma.tripPlan.create({
        data: {
          conversationId: conversation.id,
          userId,
          destination: agentResponse.tripPlan.destination,
          departureCity: agentResponse.tripPlan.departureCity,
          startDate: new Date(agentResponse.tripPlan.startDate),
          endDate: new Date(agentResponse.tripPlan.endDate),
          purpose: agentResponse.tripPlan.purpose || '',
          budget: agentResponse.tripPlan.budget,
          currency: agentResponse.tripPlan.currency || 'ZAR',
          flights: (agentResponse.tripPlan.flights ?? []) as any,
          hotels: (agentResponse.tripPlan.hotels ?? []) as any,
          carRentals: (agentResponse.tripPlan.carRentals ?? []) as any,
          totalEstimate: agentResponse.tripPlan.totalEstimate || 0,
        },
      });
    }

    // Update conversation timestamp
    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return {
      conversationId: conversation.id,
      message: assistantMessage,
    };
  }

  async deleteConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'ARCHIVED' },
    });
  }
}
