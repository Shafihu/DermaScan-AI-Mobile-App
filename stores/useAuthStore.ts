import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  apiService,
  LoginRequest,
  SignupRequest,
  UserProfile,
} from "../services/apiService";

export interface User {
  id: string;
  email: string;
  fullName: string;
  profileImage?: string;
  bio?: string;
}

export interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  checkAuthStatus: () => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isOnline: true,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const { isOnline } = get();

          if (isOnline) {
            // Use API service
            const response = await apiService.login({ email, password });
            const user: User = {
              id: response.data.user._id,
              email: response.data.user.email,
              fullName: response.data.user.fullName,
              profileImage: response.data.user.profileImage,
              bio: response.data.user.bio ?? "",
            };

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // Fallback to local storage for offline mode
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const user: User = {
              id: "user_" + Date.now(),
              email,
              fullName: email.split("@")[0],
            };

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Login failed. Please try again.",
          });
          throw error;
        }
      },

      signup: async (fullName: string, email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const { isOnline } = get();

          if (isOnline) {
            // Use API service
            const response = await apiService.signup({
              fullName,
              email,
              password,
            });
            const user: User = {
              id: response.data.user._id,
              email: response.data.user.email,
              fullName: response.data.user.fullName,
              profileImage: response.data.user.profileImage,
              bio: response.data.user.bio ?? "",
            };

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // Fallback to local storage for offline mode
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const user: User = {
              id: "user_" + Date.now(),
              email,
              fullName,
            };

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Sign up failed. Please try again.",
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          const { isOnline } = get();

          if (isOnline) {
            await apiService.logout();
          } else {
            // Simulate API call for offline mode
            await new Promise((resolve) => setTimeout(resolve, 500));
          }

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        const { user, isOnline } = get();
        if (!user) return;

        try {
          if (isOnline) {
            // Use API service
            const response = await apiService.updateProfile(updates);

            // The API response has a nested structure with data.user
            const userData = (response as any).data?.user || response;

            const updatedUser: User = {
              id: userData._id,
              email: userData.email,
              fullName: userData.fullName,
              profileImage: userData.profileImage,
              bio: userData.bio ?? "",
            };

            set({ user: updatedUser });
          } else {
            // Update local state only
            set({ user: { ...user, ...updates } });
          }
        } catch (error) {
          console.log("ℹ️ Profile update failed, keeping local changes");
          // Fallback to local update
          set({ user: { ...user, ...updates } });
        }
      },

      checkAuthStatus: async () => {
        try {
          const { isOnline } = get();

          if (isOnline) {
            const isAuthenticated = await apiService.isAuthenticated();
            if (isAuthenticated) {
              try {
                const profile = await apiService.getProfile();
                const user: User = {
                  id: profile._id,
                  email: profile.email,
                  fullName: profile.fullName,
                  profileImage: profile.profileImage,
                  bio: profile.bio ?? "",
                };
                set({ user, isAuthenticated: true });
              } catch (error) {
                // Profile endpoint might not be implemented yet, that's okay
                console.log(
                  "ℹ️ Profile endpoint not available, keeping current user data"
                );
              }
            } else {
              set({ user: null, isAuthenticated: false });
            }
          }
        } catch (error) {
          console.log("ℹ️ Auth status check failed, keeping current state");
        }
      },

      setOnlineStatus: (isOnline: boolean) => {
        set({ isOnline });
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isOnline: state.isOnline,
      }),
    }
  )
);
