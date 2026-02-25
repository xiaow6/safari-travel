import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { MockSupplierService } from './mock-supplier.service';
import { AgentResponse } from './agent.service';

const SYSTEM_PROMPT = `You are Safari Travel AI, an intelligent corporate travel assistant specializing in South African business travel.

Your capabilities:
- Plan business trips within and to/from South Africa
- Search for flights, hotels, and car rentals
- Ensure compliance with company travel policies
- Provide safety information about South African destinations
- Give local recommendations (restaurants, transport, cultural tips)

Key South African context:
- Currency: South African Rand (ZAR)
- Major business cities: Johannesburg (JNB/OR Tambo), Cape Town (CPT), Durban (DUR), Pretoria (PTA)
- Major airlines: FlySafair, Kulula, SAA, Airlink, LIFT
- Safety: Always provide relevant safety tips for the destination area
- Time zone: SAST (UTC+2)

When a user asks to plan a trip:
1. Extract: departure city, destination, dates, purpose, budget, preferences
2. If any essential info is missing, ask for it conversationally
3. When you have enough info, use the search tools to find options
4. Present results with policy compliance notes
5. Offer to book selected options

Always be helpful, professional, and proactive about safety information.
Respond in the same language the user writes in.`;

const TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: 'search_flights',
    description:
      'Search for available flights. Use this when the user wants to find flights between cities.',
    input_schema: {
      type: 'object' as const,
      properties: {
        origin: {
          type: 'string',
          description: 'Departure city or airport code (e.g., "Johannesburg" or "JNB")',
        },
        destination: {
          type: 'string',
          description: 'Arrival city or airport code (e.g., "Cape Town" or "CPT")',
        },
        departure_date: {
          type: 'string',
          description: 'Departure date in YYYY-MM-DD format',
        },
        return_date: {
          type: 'string',
          description: 'Return date in YYYY-MM-DD format (optional for one-way)',
        },
        cabin_class: {
          type: 'string',
          enum: ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'],
          description: 'Preferred cabin class',
        },
      },
      required: ['origin', 'destination', 'departure_date'],
    },
  },
  {
    name: 'search_hotels',
    description:
      'Search for available hotels. Use this when the user needs accommodation.',
    input_schema: {
      type: 'object' as const,
      properties: {
        city: {
          type: 'string',
          description: 'City name (e.g., "Cape Town")',
        },
        check_in: {
          type: 'string',
          description: 'Check-in date in YYYY-MM-DD format',
        },
        check_out: {
          type: 'string',
          description: 'Check-out date in YYYY-MM-DD format',
        },
        max_price_per_night: {
          type: 'number',
          description: 'Maximum price per night in ZAR',
        },
        min_star_rating: {
          type: 'number',
          description: 'Minimum star rating (1-5)',
        },
      },
      required: ['city', 'check_in', 'check_out'],
    },
  },
  {
    name: 'search_car_rentals',
    description:
      'Search for car rental options. Use this when the user needs a rental car.',
    input_schema: {
      type: 'object' as const,
      properties: {
        city: {
          type: 'string',
          description: 'Pickup city (e.g., "Johannesburg")',
        },
        pickup_date: {
          type: 'string',
          description: 'Pickup date in YYYY-MM-DD format',
        },
        dropoff_date: {
          type: 'string',
          description: 'Drop-off date in YYYY-MM-DD format',
        },
        vehicle_type: {
          type: 'string',
          enum: ['economy', 'compact', 'midsize', 'suv', 'luxury'],
          description: 'Preferred vehicle type',
        },
      },
      required: ['city', 'pickup_date', 'dropoff_date'],
    },
  },
  {
    name: 'get_safety_info',
    description:
      'Get safety information and travel advisories for a South African city or area.',
    input_schema: {
      type: 'object' as const,
      properties: {
        location: {
          type: 'string',
          description: 'City or area name',
        },
      },
      required: ['location'],
    },
  },
];

@Injectable()
export class TripPlannerAgent {
  private client: Anthropic;
  private readonly logger = new Logger(TripPlannerAgent.name);

  constructor(
    private configService: ConfigService,
    private supplierService: MockSupplierService,
  ) {
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async process(
    messages: { role: string; content: string }[],
    companyPolicy?: Record<string, unknown>,
  ): Promise<AgentResponse> {
    const systemPrompt = companyPolicy
      ? `${SYSTEM_PROMPT}\n\nCompany Travel Policy:\n${JSON.stringify(companyPolicy, null, 2)}`
      : SYSTEM_PROMPT;

    const apiMessages: Anthropic.Messages.MessageParam[] = messages.map((m) => ({
      role: m.role === 'USER' ? 'user' : 'assistant',
      content: m.content,
    })) as Anthropic.Messages.MessageParam[];

    let tripPlanData: AgentResponse['tripPlan'] | undefined;
    const toolCallResults: Array<{ toolName: string; input: Record<string, unknown>; output: unknown }> = [];

    // Agentic loop: keep going until Claude stops calling tools
    let currentMessages = [...apiMessages];
    let finalText = '';

    for (let i = 0; i < 10; i++) {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        system: systemPrompt,
        tools: TOOLS,
        messages: currentMessages,
      });

      if (response.stop_reason === 'end_turn') {
        // Extract final text
        for (const block of response.content) {
          if (block.type === 'text') {
            finalText += block.text;
          }
        }
        break;
      }

      // Process tool use blocks
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.Messages.ToolUseBlock => b.type === 'tool_use',
      );

      if (toolUseBlocks.length === 0) {
        for (const block of response.content) {
          if (block.type === 'text') {
            finalText += block.text;
          }
        }
        break;
      }

      // Append assistant response
      currentMessages.push({ role: 'assistant', content: response.content });

      // Execute tools and collect results
      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

      for (const toolBlock of toolUseBlocks) {
        const result = await this.executeTool(toolBlock.name, toolBlock.input as Record<string, unknown>);
        toolCallResults.push({
          toolName: toolBlock.name,
          input: toolBlock.input as Record<string, unknown>,
          output: result,
        });

        // Extract trip plan data from search results
        if (toolBlock.name === 'search_flights' && result.flights) {
          const input = toolBlock.input as Record<string, string>;
          tripPlanData = {
            ...tripPlanData,
            departureCity: input.origin || '',
            destination: input.destination || '',
            startDate: input.departure_date || '',
            endDate: input.return_date || input.departure_date || '',
            flights: result.flights,
          };
        }
        if (toolBlock.name === 'search_hotels' && result.hotels) {
          tripPlanData = {
            ...tripPlanData,
            destination: tripPlanData?.destination || (toolBlock.input as Record<string, string>).city || '',
            departureCity: tripPlanData?.departureCity || '',
            startDate: tripPlanData?.startDate || (toolBlock.input as Record<string, string>).check_in || '',
            endDate: tripPlanData?.endDate || (toolBlock.input as Record<string, string>).check_out || '',
            hotels: result.hotels,
          };
        }
        if (toolBlock.name === 'search_car_rentals' && result.carRentals) {
          tripPlanData = {
            ...tripPlanData,
            destination: tripPlanData?.destination || (toolBlock.input as Record<string, string>).city || '',
            departureCity: tripPlanData?.departureCity || '',
            startDate: tripPlanData?.startDate || (toolBlock.input as Record<string, string>).pickup_date || '',
            endDate: tripPlanData?.endDate || (toolBlock.input as Record<string, string>).dropoff_date || '',
            carRentals: result.carRentals,
          };
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolBlock.id,
          content: JSON.stringify(result),
        });
      }

      currentMessages.push({ role: 'user', content: toolResults });

      // Also extract any text from the response that included tool calls
      for (const block of response.content) {
        if (block.type === 'text') {
          finalText += block.text;
        }
      }
    }

    // Calculate total estimate if we have trip plan data
    if (tripPlanData) {
      const flightTotal = (tripPlanData.flights as any[])?.reduce((sum: number, f: any) => sum + (f.price || 0), 0) || 0;
      const hotelTotal = (tripPlanData.hotels as any[])?.reduce((sum: number, h: any) => sum + (h.totalPrice || 0), 0) || 0;
      const carTotal = (tripPlanData.carRentals as any[])?.reduce((sum: number, c: any) => sum + (c.totalPrice || 0), 0) || 0;
      tripPlanData.totalEstimate = flightTotal + hotelTotal + carTotal;
      tripPlanData.currency = 'ZAR';
    }

    return {
      content: finalText,
      metadata: toolCallResults.length > 0
        ? { toolCalls: toolCallResults }
        : undefined,
      tripPlan: tripPlanData,
    };
  }

  private async executeTool(
    name: string,
    input: Record<string, unknown>,
  ): Promise<any> {
    this.logger.debug(`Executing tool: ${name}`, input);

    switch (name) {
      case 'search_flights':
        return this.supplierService.searchFlights(input);
      case 'search_hotels':
        return this.supplierService.searchHotels(input);
      case 'search_car_rentals':
        return this.supplierService.searchCarRentals(input);
      case 'get_safety_info':
        return this.supplierService.getSafetyInfo(input.location as string);
      default:
        return { error: `Unknown tool: ${name}` };
    }
  }
}
