import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../stores/useAuthStore";

// Base API configuration
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
const API_TIMEOUT = 10000; // 10 seconds

// Types for API requests and responses
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    profileImage?: string;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  profileImage?: string;
}

export interface ScanAnalysisRequest {
  image: FormData;
  description?: string;
}

export interface ScanAnalysisResponse {
  id: string;
  userId: string;
  imageUrl: string;
  condition: string;
  confidence: number;
  severity: string;
  description: string;
  symptoms: string[];
  recommendations: {
    title: string;
    description: string;
    icon: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ScanHistoryResponse {
  scans: ScanAnalysisResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserSettings {
  notifications: {
    enabled: boolean;
    scanReminders: boolean;
    healthTips: boolean;
  };
  privacy: {
    shareData: boolean;
    anonymousMode: boolean;
  };
  preferences: {
    theme: "light" | "dark" | "auto";
    language: string;
    units: "metric" | "imperial";
  };
}

export interface AnalyticsResponse {
  totalScans: number;
  averageConfidence: number;
  mostCommonConditions: Array<{
    condition: string;
    count: number;
  }>;
  scanTrends: Array<{
    date: string;
    count: number;
  }>;
  healthScore: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// API Service Class
class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("@DermaScanAI:authToken");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  private async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem("@DermaScanAI:authToken", token);
    } catch (error) {
      console.error("Error setting auth token:", error);
    }
  }

  private async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem("@DermaScanAI:authToken");
    } catch (error) {
      console.error("Error removing auth token:", error);
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    await this.setAuthToken(response.token);
    return response;
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    await this.setAuthToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      await this.removeAuthToken();
    }
  }

  async getProfile(): Promise<UserProfile> {
    return await this.makeRequest<UserProfile>("/auth/profile");
  }

  async updateProfile(updates: UpdateProfileRequest): Promise<UserProfile> {
    return await this.makeRequest<UserProfile>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // Scan analysis endpoints
  async analyzeScan(
    imageFile: File,
    description?: string
  ): Promise<ScanAnalysisResponse> {
    const formData = new FormData();
    formData.append("image", imageFile);
    if (description) {
      formData.append("description", description);
    }

    return await this.makeRequest<ScanAnalysisResponse>("/scans/analyze", {
      method: "POST",
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async saveScan(
    scanData: Omit<
      ScanAnalysisResponse,
      "id" | "userId" | "createdAt" | "updatedAt"
    >
  ): Promise<ScanAnalysisResponse> {
    return await this.makeRequest<ScanAnalysisResponse>("/scans", {
      method: "POST",
      body: JSON.stringify(scanData),
    });
  }

  async getScanHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<ScanHistoryResponse> {
    return await this.makeRequest<ScanHistoryResponse>(
      `/scans/history?page=${page}&limit=${limit}`
    );
  }

  async getScanById(id: string): Promise<ScanAnalysisResponse> {
    return await this.makeRequest<ScanAnalysisResponse>(`/scans/${id}`);
  }

  async deleteScan(id: string): Promise<void> {
    await this.makeRequest(`/scans/${id}`, {
      method: "DELETE",
    });
  }

  // Settings endpoints
  async getUserSettings(): Promise<UserSettings> {
    return await this.makeRequest<UserSettings>("/settings");
  }

  async updateUserSettings(
    settings: Partial<UserSettings>
  ): Promise<UserSettings> {
    return await this.makeRequest<UserSettings>("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }

  // Analytics endpoints
  async getAnalytics(): Promise<AnalyticsResponse> {
    return await this.makeRequest<AnalyticsResponse>("/analytics");
  }

  async getHealthScore(): Promise<{ score: number }> {
    return await this.makeRequest<{ score: number }>("/analytics/health-score");
  }

  // Utility methods
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    if (!token) return false;

    try {
      await this.getProfile();
      return true;
    } catch (error) {
      await this.removeAuthToken();
      return false;
    }
  }

  async refreshToken(): Promise<void> {
    try {
      const response = await this.makeRequest<{ token: string }>(
        "/auth/refresh",
        {
          method: "POST",
        }
      );
      await this.setAuthToken(response.token);
    } catch (error) {
      await this.removeAuthToken();
      throw error;
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Hook for easy API service access
export const useApiService = () => apiService;
