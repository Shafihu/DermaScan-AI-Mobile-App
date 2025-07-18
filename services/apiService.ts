import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../stores/useAuthStore";

// Base API configuration
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://172.20.10.4:5000/api";

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
  data: {
    user: {
      _id: string;
      email: string;
      fullName: string;
      profileImage?: string;
      createdAt: string;
      updatedAt: string;
      isActive?: boolean;
      lastLoginAt?: string;
      bio?: string;
    };
    token: string;
  };
  message: string;
  success: boolean;
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
  username?: string;
  fullName?: string;
  profileImage?: string;
  bio?: string;
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

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// API Service Class
class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("@DermaScanAI:authToken");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  private async setAuthToken(token: string | undefined): Promise<void> {
    try {
      if (token) {
        await AsyncStorage.setItem("@DermaScanAI:authToken", token);
      } else {
        console.warn("No token provided to setAuthToken");
      }
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
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Only log as error if it's not a 404 (expected for unimplemented endpoints)
        if (response.status === 404) {
          console.log(
            "ℹ️ Endpoint not implemented:",
            response.status,
            errorData.message
          );
        } else {
          console.error("❌ API Error:", response.status, errorData);
        }

        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const responseData = await response.json();
      console.log("✅ API Response:", responseData);
      return responseData;
    } catch (error) {
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log("🔐 Attempting login with:", credentials.email);
    const response = await this.makeRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    console.log("🔐 Login response:", response);
    await this.setAuthToken(response.data.token);
    return response;
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    console.log("📝 Attempting signup with:", userData.email);
    const response = await this.makeRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    console.log("📝 Signup response:", response);
    await this.setAuthToken(response.data.token);
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

  async getProfile(): Promise<AuthResponse["data"]["user"]> {
    return await this.makeRequest<AuthResponse["data"]["user"]>(
      "/auth/profile"
    );
  }

  async updateProfile(
    updates: UpdateProfileRequest
  ): Promise<AuthResponse["data"]["user"]> {
    console.log("📝 Attempting profile update with:", updates);

    // Check if we have a local file image to upload
    const hasLocalImage =
      updates.profileImage && updates.profileImage.startsWith("file://");

    if (hasLocalImage) {
      // Use FormData for file upload
      const formData = new FormData();

      // Add the image file
      const imageFile = {
        uri: updates.profileImage,
        type: "image/jpeg",
        name: "profile-image.jpg",
      } as any;
      formData.append("profileImage", imageFile);

      // Add other fields as text
      if (updates.fullName) formData.append("fullName", updates.fullName);
      if (updates.bio) formData.append("bio", updates.bio);
      if (updates.username) formData.append("username", updates.username);

      const response = await this.makeRequest<AuthResponse["data"]["user"]>(
        "/auth/profile",
        {
          method: "PUT",
          headers: {}, // Let browser set Content-Type for FormData
          body: formData,
        }
      );

      console.log("📝 Profile update response:", response);
      return response;
    } else {
      // Use JSON for regular updates
      const response = await this.makeRequest<AuthResponse["data"]["user"]>(
        "/auth/profile",
        {
          method: "PUT",
          body: JSON.stringify(updates),
        }
      );

      console.log("📝 Profile update response:", response);
      return response;
    }
  }

  async deleteProfileImage(): Promise<void> {
    console.log("🗑️ Deleting profile image...");
    await this.makeRequest("/auth/profile/image", {
      method: "DELETE",
    });
    console.log("🗑️ Profile image deleted successfully");
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

  // Utility methods
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    if (!token) return false;

    try {
      // Simple token validation - just check if token exists
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
