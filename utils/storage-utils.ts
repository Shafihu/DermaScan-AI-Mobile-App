import AsyncStorage from "@react-native-async-storage/async-storage";

// Simple UUID generator that works in React Native
const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const HISTORY_STORAGE_KEY = "@DermaScanAI:history";

// Type definitions
export type Recommendation = {
  title: string;
  description: string;
  icon: string;
};

export type ScanResult = {
  id: string;
  imageUri: string;
  condition: string;
  confidence: number;
  severity: string;
  date: number; // timestamp
  description?: string;
  symptoms?: string[];
  recommendations?: Recommendation[];
};

// Update the saveScanToHistory function to accept the complete analysis result
export const saveScanToHistory = async (
  imageUri: string,
  condition: string,
  confidence: number,
  severity: string,
  description?: string,
  symptoms?: string[],
  recommendations?: Recommendation[]
): Promise<void> => {
  try {
    // Create new scan result object with all analysis data
    const newScan: ScanResult = {
      id: generateUUID(),
      imageUri,
      condition,
      confidence,
      severity,
      date: Date.now(),
      description,
      symptoms,
      recommendations,
    };

    // Get existing history
    const existingHistory = await getHistory();

    // Add new scan to history
    const updatedHistory = [newScan, ...existingHistory];

    // Save updated history
    await AsyncStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(updatedHistory)
    );

    console.log("Scan saved to history successfully");
  } catch (error) {
    console.error("Error saving scan to history:", error);
    throw error;
  }
};

// Get all history items
export const getHistory = async (): Promise<ScanResult[]> => {
  try {
    const historyData = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    if (historyData) {
      return JSON.parse(historyData) as ScanResult[];
    }
    return [];
  } catch (error) {
    console.error("Error getting history:", error);
    return [];
  }
};

// Delete a specific history item
export const deleteHistoryItem = async (id: string): Promise<void> => {
  try {
    const history = await getHistory();
    const updatedHistory = history.filter((item) => item.id !== id);
    await AsyncStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(updatedHistory)
    );
  } catch (error) {
    console.error("Error deleting history item:", error);
    throw error;
  }
};

// Clear all history
export const clearHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing history:", error);
    throw error;
  }
};
