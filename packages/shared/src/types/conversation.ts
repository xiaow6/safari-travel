export interface Conversation {
  id: string;
  userId: string;
  title: string;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export enum ConversationStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  metadata?: MessageMetadata;
  createdAt: string;
}

export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
}

export interface MessageMetadata {
  agentType?: AgentType;
  toolCalls?: ToolCallResult[];
  tripResults?: TripSearchResult[];
}

export type AgentType = 'TRIP_PLANNER' | 'REALTIME_ASSISTANT' | 'BOOKING_EXECUTOR' | 'LOCAL_EXPERIENCE';

export interface ToolCallResult {
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
}

export interface TripSearchResult {
  type: 'flight' | 'hotel' | 'car';
  results: unknown[];
}

export interface SendMessageRequest {
  content: string;
  conversationId?: string;
}

export interface SendMessageResponse {
  conversationId: string;
  message: Message;
}
