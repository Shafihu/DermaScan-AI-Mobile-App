import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScanResult, Recommendation } from "../utils/storage-utils";

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

  // Actions
  addScanResult: (scan: ScanResult) => void;
  deleteScanResult: (id: string) => void;
  clearHistory: () => void;
  setCurrentScan: (imageUri: string | null) => void;
  setProcessing: (isProcessing: boolean, message?: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  loadHistory: () => Promise<void>;
}

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

      // Actions
      addScanResult: (scan: ScanResult) => {
        const { scanHistory } = get();
        set({
          scanHistory: [scan, ...scanHistory],
          currentScan: {
            imageUri: null,
            isProcessing: false,
            loadingMessage: "Analyzing skin...",
          },
        });
      },

      deleteScanResult: (id: string) => {
        const { scanHistory } = get();
        set({
          scanHistory: scanHistory.filter((scan) => scan.id !== id),
        });
      },

      clearHistory: () => {
        set({ scanHistory: [] });
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

          // Load from AsyncStorage for backward compatibility
          const historyData = await AsyncStorage.getItem(
            "@DermaScanAI:history"
          );
          if (historyData) {
            const history = JSON.parse(historyData) as ScanResult[];
            set({ scanHistory: history.sort((a, b) => b.date - a.date) });
          }
        } catch (error) {
          console.error("Error loading scan history:", error);
          set({ error: "Failed to load scan history" });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "scan-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        scanHistory: state.scanHistory,
      }),
    }
  )
);
