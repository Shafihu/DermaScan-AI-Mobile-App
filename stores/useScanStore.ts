import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScanResult, Recommendation } from "../utils/storage-utils";
import { apiService, ScanAnalysisResponse } from "../services/apiService";

export interface ScanState {
  // State
  scanHistory: ScanResult[];
  currentScan: {
    imageUri: string | null;
    isProcessing: boolean;
    loadingMessage: string;
  };
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
  syncStatus: "idle" | "syncing" | "error";

  // Actions
  addScanResult: (scan: ScanResult) => void;
  deleteScanResult: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  setCurrentScan: (imageUri: string | null) => void;
  setProcessing: (isProcessing: boolean, message?: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  loadHistory: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => void;
  setSyncStatus: (status: "idle" | "syncing" | "error") => void;
}

// Helper function to convert API response to local format
const convertApiResponseToLocal = (
  apiScan: ScanAnalysisResponse
): ScanResult => ({
  id: apiScan.id,
  imageUri: apiScan.imageUrl,
  condition: apiScan.condition,
  confidence: apiScan.confidence,
  severity: apiScan.severity,
  date: new Date(apiScan.createdAt).getTime(),
  description: apiScan.description,
  symptoms: apiScan.symptoms,
  recommendations: apiScan.recommendations,
});

// Helper function to convert local format to API format
const convertLocalToApiFormat = (localScan: ScanResult) => ({
  imageUrl: localScan.imageUri,
  condition: localScan.condition,
  confidence: localScan.confidence,
  severity: localScan.severity,
  description: localScan.description || "",
  symptoms: localScan.symptoms || [],
  recommendations: localScan.recommendations || [],
});

export const useScanStore = create<ScanState>()(
  persist(
    (set, get) => ({
      // Initial state
      scanHistory: [],
      currentScan: {
        imageUri: null,
        isProcessing: false,
        loadingMessage: "Analyzing skin...",
      },
      isLoading: false,
      error: null,
      isOnline: true,
      syncStatus: "idle",

      // Actions
      addScanResult: (scan: ScanResult) => {
        const { scanHistory, isOnline } = get();
        set({
          scanHistory: [scan, ...scanHistory],
          currentScan: {
            imageUri: null,
            isProcessing: false,
            loadingMessage: "Analyzing skin...",
          },
        });

        // If online, try to save to server
        if (isOnline) {
          get().syncWithServer();
        }
      },

      deleteScanResult: async (id: string) => {
        const { scanHistory, isOnline } = get();

        try {
          if (isOnline) {
            await apiService.deleteScan(id);
          }

          set({
            scanHistory: scanHistory.filter((scan) => scan.id !== id),
          });
        } catch (error) {
          console.error("Error deleting scan:", error);
          // Still remove from local state even if server delete fails
          set({
            scanHistory: scanHistory.filter((scan) => scan.id !== id),
          });
        }
      },

      clearHistory: async () => {
        const { isOnline } = get();

        try {
          if (isOnline) {
            // Note: Backend doesn't have a bulk delete endpoint, so we'll clear locally
            // In a real implementation, you might want to add a bulk delete endpoint
            console.log("Clearing local history only");
          }

          set({ scanHistory: [] });
        } catch (error) {
          console.error("Error clearing history:", error);
          set({ scanHistory: [] });
        }
      },

      setCurrentScan: (imageUri: string | null) => {
        set({
          currentScan: {
            ...get().currentScan,
            imageUri,
          },
        });
      },

      setProcessing: (isProcessing: boolean, message?: string) => {
        set({
          currentScan: {
            ...get().currentScan,
            isProcessing,
            loadingMessage: message || "Analyzing skin...",
          },
        });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      loadHistory: async () => {
        try {
          set({ isLoading: true });
          const { isOnline } = get();

          if (isOnline) {
            // Try to load from server
            try {
              const serverHistory = await apiService.getScanHistory();
              const convertedHistory = serverHistory.scans.map(
                convertApiResponseToLocal
              );
              set({ scanHistory: convertedHistory });
            } catch (error) {
              console.error(
                "Error loading from server, falling back to local:",
                error
              );
              // Fallback to local storage
              await loadLocalHistory();
            }
          } else {
            // Load from local storage only
            await loadLocalHistory();
          }
        } catch (error) {
          console.error("Error loading scan history:", error);
          set({ error: "Failed to load scan history" });
        } finally {
          set({ isLoading: false });
        }
      },

      syncWithServer: async () => {
        const { isOnline, syncStatus } = get();
        if (!isOnline || syncStatus === "syncing") return;

        try {
          set({ syncStatus: "syncing" });

          // Get local scans that don't have server IDs (indicating they're not synced)
          const { scanHistory } = get();
          const unsyncedScans = scanHistory.filter(
            (scan) => scan.id.startsWith("local_") || scan.id.length < 20 // Simple heuristic for local IDs
          );

          // Upload unsynced scans to server
          for (const localScan of unsyncedScans) {
            try {
              const apiFormat = convertLocalToApiFormat(localScan);
              const serverScan = await apiService.saveScan(apiFormat);

              // Update local scan with server ID
              const updatedHistory = scanHistory.map((scan) =>
                scan.id === localScan.id
                  ? convertApiResponseToLocal(serverScan)
                  : scan
              );

              set({ scanHistory: updatedHistory });
            } catch (error) {
              console.error("Error syncing scan:", localScan.id, error);
            }
          }

          set({ syncStatus: "idle" });
        } catch (error) {
          console.error("Error during sync:", error);
          set({ syncStatus: "error" });
        }
      },

      setOnlineStatus: (isOnline: boolean) => {
        set({ isOnline });
        if (isOnline) {
          // Trigger sync when coming back online
          get().syncWithServer();
        }
      },

      setSyncStatus: (status: "idle" | "syncing" | "error") => {
        set({ syncStatus: status });
      },
    }),
    {
      name: "scan-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        scanHistory: state.scanHistory,
        isOnline: state.isOnline,
      }),
    }
  )
);

// Helper function to load local history
async function loadLocalHistory(): Promise<void> {
  try {
    const historyData = await AsyncStorage.getItem("@DermaScanAI:history");
    if (historyData) {
      const history = JSON.parse(historyData) as ScanResult[];
      useScanStore.setState({
        scanHistory: history.sort((a, b) => b.date - a.date),
      });
    }
  } catch (error) {
    console.error("Error loading local history:", error);
  }
}
