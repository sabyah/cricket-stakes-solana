// API client for backend communication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface ApiError {
  error: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'API request failed');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  async verifyToken(accessToken: string) {
    return this.request<{
      user: {
        id: string;
        privyUserId: string;
        email?: string;
        name?: string;
        avatar?: string;
      };
      wallets: Array<{
        id: string;
        address: string;
        walletType: string;
        chainType: string;
        isPrimary: boolean;
      }>;
    }>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
    });
  }

  async getCurrentUser(token: string) {
    return this.request<{
      user: {
        id: string;
        privyUserId: string;
        email?: string;
        name?: string;
        avatar?: string;
      };
      wallets: Array<{
        id: string;
        address: string;
        walletType: string;
        chainType: string;
        isPrimary: boolean;
      }>;
    }>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getUserProfile(token: string) {
    return this.request<{
      user: {
        id: string;
        privyUserId: string;
        email?: string;
        name?: string;
        avatar?: string;
        createdAt: string;
        updatedAt: string;
      };
      wallets: Array<{
        id: string;
        address: string;
        walletType: string;
        chainType: string;
        isPrimary: boolean;
      }>;
    }>('/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getWallets(token: string) {
    return this.request<{
      wallets: Array<{
        id: string;
        address: string;
        walletType: string;
        chainType: string;
        isPrimary: boolean;
        createdAt: string;
      }>;
    }>('/wallet', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async setPrimaryWallet(token: string, walletId: string) {
    return this.request<{
      wallet: {
        id: string;
        address: string;
        walletType: string;
        chainType: string;
        isPrimary: boolean;
      };
    }>(`/wallet/${walletId}/primary`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
