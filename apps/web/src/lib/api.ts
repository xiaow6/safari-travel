const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async register(data: { email: string; password: string; name: string; companyName?: string }) {
    const result = await this.fetch<{ accessToken: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.accessToken);
    return result;
  }

  async login(email: string, password: string) {
    const result = await this.fetch<{ accessToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(result.accessToken);
    return result;
  }

  async getProfile() {
    return this.fetch<any>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Conversations
  async listConversations() {
    return this.fetch<any[]>('/conversations');
  }

  async getConversation(id: string) {
    return this.fetch<any>(`/conversations/${id}`);
  }

  async sendMessage(content: string, conversationId?: string) {
    return this.fetch<{ conversationId: string; message: any }>('/conversations/message', {
      method: 'POST',
      body: JSON.stringify({ content, conversationId }),
    });
  }

  async deleteConversation(id: string) {
    return this.fetch<void>(`/conversations/${id}`, { method: 'DELETE' });
  }

  // Bookings
  async createBooking(data: { tripPlanId: string; type: string; selectedOptionId: string }) {
    return this.fetch<any>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listBookings() {
    return this.fetch<any[]>('/bookings');
  }

  async cancelBooking(id: string) {
    return this.fetch<any>(`/bookings/${id}/cancel`, { method: 'PATCH' });
  }
}

export const api = new ApiClient();
