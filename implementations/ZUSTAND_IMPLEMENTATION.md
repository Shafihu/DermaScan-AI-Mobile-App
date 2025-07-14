# Zustand State Management Implementation

This document describes the Zustand state management implementation for the DermaScanAI app.

## Overview

We've implemented three main Zustand stores to manage different aspects of the application:

1. **AuthStore** - User authentication and profile management
2. **ScanStore** - Scan history and current scan state
3. **AppStore** - App settings and preferences

## Store Structure

### 1. AuthStore (`stores/useAuthStore.ts`)

Manages user authentication and profile data.

**State:**
- `user: User | null` - Current user data
- `isAuthenticated: boolean` - Authentication status
- `isLoading: boolean` - Loading state
- `error: string | null` - Error messages

**Actions:**
- `login(email, password)` - User login
- `signup(fullName, email, password)` - User registration
- `logout()` - User logout
- `updateProfile(updates)` - Update user profile
- `clearError()` - Clear error state
- `setLoading(loading)` - Set loading state

**Usage:**
```typescript
import { useAuthStore } from '@/stores';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  
  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password');
      // Navigate to main app
    } catch (error) {
      // Handle error
    }
  };
}
```

### 2. ScanStore (`stores/useScanStore.ts`)

Manages scan history and current scan operations.

**State:**
- `scanHistory: ScanResult[]` - Array of scan results
- `currentScan: { imageUri, isProcessing, loadingMessage }` - Current scan state
- `isLoading: boolean` - Loading state
- `error: string | null` - Error messages

**Actions:**
- `addScanResult(scan)` - Add new scan to history
- `deleteScanResult(id)` - Delete scan from history
- `clearHistory()` - Clear all scan history
- `setCurrentScan(imageUri)` - Set current scan image
- `setProcessing(isProcessing, message)` - Set processing state
- `setError(error)` - Set error state
- `setLoading(loading)` - Set loading state
- `loadHistory()` - Load history from storage

**Usage:**
```typescript
import { useScanStore } from '@/stores';

function ScanScreen() {
  const { 
    scanHistory, 
    currentScan, 
    addScanResult, 
    setProcessing 
  } = useScanStore();
  
  const handleScan = async () => {
    setProcessing(true, 'Analyzing skin...');
    // Process scan...
    addScanResult(scanResult);
  };
}
```

### 3. AppStore (`stores/useAppStore.ts`)

Manages app-wide settings and preferences.

**State:**
- `settings: AppSettings` - App settings object
- `isOnboardingComplete: boolean` - Onboarding status
- `isWelcomeShown: boolean` - Welcome screen status
- `isLoading: boolean` - Loading state

**Settings:**
- `notificationsEnabled: boolean`
- `darkModeEnabled: boolean`
- `hapticFeedbackEnabled: boolean`
- `autoSaveScans: boolean`
- `language: string`

**Actions:**
- `updateSettings(updates)` - Update app settings
- `setOnboardingComplete(complete)` - Set onboarding status
- `setWelcomeShown(shown)` - Set welcome screen status
- `setLoading(loading)` - Set loading state
- `resetApp()` - Reset app to defaults

**Usage:**
```typescript
import { useAppStore } from '@/stores';

function SettingsScreen() {
  const { settings, updateSettings } = useAppStore();
  
  const toggleNotifications = () => {
    updateSettings({ notificationsEnabled: !settings.notificationsEnabled });
  };
}
```

## Migration from AsyncStorage

### Before (AsyncStorage):
```typescript
// Loading data
const loadUserData = async () => {
  const userData = await AsyncStorage.getItem('@DermaScanAI:userSession');
  const profileData = await AsyncStorage.getItem('@DermaScanAI:fullName');
  // ... more async operations
};

// Saving data
const saveUserData = async () => {
  await AsyncStorage.setItem('@DermaScanAI:userSession', 'true');
  await AsyncStorage.setItem('@DermaScanAI:fullName', fullName);
  // ... more async operations
};
```

### After (Zustand):
```typescript
// Loading data - automatic with persist middleware
const { user, isAuthenticated } = useAuthStore();

// Saving data
const { updateProfile } = useAuthStore();
await updateProfile({ fullName: 'New Name' });
```

## Benefits of Zustand Implementation

1. **Centralized State Management**: All app state is managed in one place
2. **Automatic Persistence**: Data is automatically saved to AsyncStorage
3. **Type Safety**: Full TypeScript support with proper types
4. **Performance**: Only components that use specific state will re-render
5. **Developer Experience**: Easy to debug and maintain
6. **Scalability**: Easy to add new stores and features

## Best Practices

1. **Use Selectors**: Only subscribe to the state you need
   ```typescript
   const user = useAuthStore(state => state.user);
   const isAuthenticated = useAuthStore(state => state.isAuthenticated);
   ```

2. **Handle Loading States**: Always provide loading indicators
   ```typescript
   const { isLoading } = useScanStore();
   if (isLoading) return <LoadingSpinner />;
   ```

3. **Error Handling**: Use the error state for user feedback
   ```typescript
   const { error, clearError } = useAuthStore();
   useEffect(() => {
     if (error) {
       Alert.alert('Error', error);
       clearError();
     }
   }, [error]);
   ```

4. **Async Operations**: Handle async operations properly
   ```typescript
   const handleAction = async () => {
     try {
       await someAsyncOperation();
       // Update store
     } catch (error) {
       // Handle error
     }
   };
   ```

## Migration Checklist

- [x] Create Zustand stores
- [x] Update authentication screens (login, signup)
- [x] Update home screen
- [x] Update scan screen
- [x] Update history screen
- [x] Update profile screen
- [ ] Update tips screen
- [ ] Update dermatologist screen
- [ ] Update onboarding flow
- [ ] Test all functionality
- [ ] Remove old AsyncStorage usage

## Future Enhancements

1. **Middleware**: Add logging middleware for debugging
2. **DevTools**: Integrate Redux DevTools for state inspection
3. **Optimistic Updates**: Implement optimistic UI updates
4. **Offline Support**: Add offline state management
5. **Real-time Sync**: Add real-time data synchronization

## Troubleshooting

### Common Issues:

1. **State not updating**: Check if you're using the correct store
2. **Persistence not working**: Verify AsyncStorage permissions
3. **Type errors**: Ensure all types are properly imported
4. **Performance issues**: Use selectors to prevent unnecessary re-renders

### Debug Tips:

1. Use React DevTools to inspect component re-renders
2. Add console.logs in store actions to track state changes
3. Use the persist middleware's debug option
4. Check AsyncStorage in React Native Debugger 