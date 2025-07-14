import NetInfo from "@react-native-community/netinfo";
import { useAuthStore } from "../stores/useAuthStore";
import { useScanStore } from "../stores/useScanStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useAnalyticsStore } from "../stores/useAnalyticsStore";

class NetworkService {
  private isInitialized = false;

  initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Listen for network state changes
    NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected && state.isInternetReachable;
      this.updateOnlineStatus(isConnected);
    });

    // Check initial network status
    NetInfo.fetch().then((state) => {
      const isConnected = state.isConnected && state.isInternetReachable;
      this.updateOnlineStatus(isConnected);
    });
  }

  private updateOnlineStatus(isOnline: boolean) {
    // Update all stores with the new online status
    useAuthStore.getState().setOnlineStatus(isOnline);
    useScanStore.getState().setOnlineStatus(isOnline);
    useSettingsStore.getState().setOnlineStatus(isOnline);
    useAnalyticsStore.getState().setOnlineStatus(isOnline);

    console.log(`Network status changed: ${isOnline ? "Online" : "Offline"}`);
  }

  async checkConnectivity(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
  }

  // Test API connectivity
  async testApiConnectivity(): Promise<boolean> {
    try {
      const response = await fetch("https://httpbin.org/get", {
        method: "GET",
        timeout: 5000,
      });
      return response.ok;
    } catch (error) {
      console.error("API connectivity test failed:", error);
      return false;
    }
  }
}

export const networkService = new NetworkService();
