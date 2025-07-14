# API Integration Guide

This document outlines the comprehensive API integration layer implemented for DermaScanAI, preparing the frontend for seamless backend integration.

## Overview

The API integration layer provides:
- **Dual-mode operation**: Online (API) and offline (local storage) functionality
- **Automatic synchronization**: Data syncs when connectivity is restored
- **Type-safe API calls**: Full TypeScript support for all endpoints
- **Error handling**: Graceful fallbacks and error recovery
- **Network monitoring**: Automatic online/offline status detection

## Architecture

### Core Services

#### 1. API Service (`services/apiService.ts`)
Main service handling all HTTP requests to the backend.

**Key Features:**
- Automatic token management
- Request timeout handling
- Error parsing and handling
- Type-safe request/response interfaces

**Usage:**
```typescript
import { apiService } from '../services/apiService';

// Authentication
const authResponse = await apiService.login({ email, password });
const userProfile = await apiService.getProfile();

// Scan operations
const scanResult = await apiService.analyzeScan(imageFile);
const history = await apiService.getScanHistory();

// Settings
const settings = await apiService.getUserSettings();
await apiService.updateUserSettings(newSettings);

// Analytics
const analytics = await apiService.getAnalytics();
const healthScore = await apiService.getHealthScore();
```

#### 2. Network Service (`services/networkService.ts`)
Monitors network connectivity and manages online/offline status.

**Features:**
- Real-time network state monitoring
- Automatic store status updates
- API connectivity testing

**Usage:**
```typescript
import { networkService } from '../services/networkService';

// Initialize network monitoring
networkService.initialize();

// Check connectivity
const isConnected = await networkService.checkConnectivity();
const apiReachable = await networkService.testApiConnectivity();
```

### Enhanced Stores

All stores now support dual-mode operation with automatic synchronization.

#### 1. Auth Store (`stores/useAuthStore.ts`)
**New Features:**
- Online/offline mode detection
- Automatic token refresh
- Server-side profile synchronization
- Graceful fallback to local storage

**Usage:**
```typescript
import { useAuthStore } from '../stores/useAuthStore';

const { 
  login, 
  signup, 
  logout, 
  updateProfile, 
  checkAuthStatus,
  isOnline,
  user,
  isAuthenticated 
} = useAuthStore();

// Login with automatic online/offline handling
await login(email, password);

// Check authentication status
await checkAuthStatus();

// Update profile (syncs with server when online)
await updateProfile({ fullName: "New Name" });
```

#### 2. Scan Store (`stores/useScanStore.ts`)
**New Features:**
- Automatic scan synchronization
- Server-side scan history
- Offline scan storage with sync
- Conflict resolution

**Usage:**
```typescript
import { useScanStore } from '../stores/useScanStore';

const { 
  addScanResult, 
  loadHistory, 
  syncWithServer,
  scanHistory,
  syncStatus 
} = useScanStore();

// Add scan (automatically syncs when online)
addScanResult(scanData);

// Load history (from server when online, local when offline)
await loadHistory();

// Manual sync
await syncWithServer();
```

#### 3. Settings Store (`stores/useSettingsStore.ts`)
**New Features:**
- Server-side settings persistence
- Offline settings management
- Automatic settings sync

**Usage:**
```typescript
import { useSettingsStore } from '../stores/useSettingsStore';

const { 
  loadSettings, 
  updateSettings, 
  settings 
} = useSettingsStore();

// Load settings
await loadSettings();

// Update settings (syncs with server)
await updateSettings({ 
  notifications: { enabled: false } 
});
```

#### 4. Analytics Store (`stores/useAnalyticsStore.ts`)
**New Features:**
- Server-side analytics data
- Health score tracking
- Automatic data refresh

**Usage:**
```typescript
import { useAnalyticsStore } from '../stores/useAnalyticsStore';

const { 
  loadAnalytics, 
  refreshAnalytics, 
  analytics,
  healthScore 
} = useAnalyticsStore();

// Load analytics
await loadAnalytics();

// Refresh data
await refreshAnalytics();
```

## API Endpoints Integration

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Scan Analysis Endpoints
- `POST /api/scans/analyze` - Analyze skin image
- `POST /api/scans` - Save scan result
- `GET /api/scans/history` - Get scan history
- `GET /api/scans/:id` - Get specific scan
- `DELETE /api/scans/:id` - Delete scan

### Settings Endpoints
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

### Analytics Endpoints
- `GET /api/analytics` - Get analytics data
- `GET /api/analytics/health-score` - Get health score

## Environment Configuration

### API Base URL
Set the API base URL in your environment:

```bash
# .env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### Development vs Production
```typescript
// Development
const API_BASE_URL = "http://localhost:3000/api";

// Production
const API_BASE_URL = "https://api.dermascanai.com/api";
```

## Error Handling

### Network Errors
- Automatic fallback to local storage
- Retry mechanisms for failed requests
- User-friendly error messages

### Authentication Errors
- Automatic token refresh
- Graceful logout on auth failures
- Session restoration

### Data Sync Errors
- Conflict resolution for conflicting data
- Last-write-wins strategy
- Data integrity preservation

## Offline Functionality

### Local Storage
- All data persists locally using AsyncStorage
- Offline-first approach for core functionality
- Automatic sync when connectivity returns

### Sync Strategy
1. **Immediate**: Critical operations (auth, settings)
2. **Background**: Non-critical operations (analytics, history)
3. **On-demand**: User-triggered sync operations

## Migration Guide

### From Local-Only to API-Enabled

1. **Update Store Imports**
```typescript
// Old
import { useAuthStore } from '../stores/useAuthStore';

// New (no changes needed - backward compatible)
import { useAuthStore } from '../stores/useAuthStore';
```

2. **Initialize Network Service**
```typescript
// In your main app component
import { networkService } from '../services/networkService';

useEffect(() => {
  networkService.initialize();
}, []);
```

3. **Handle Online/Offline States**
```typescript
const { isOnline } = useAuthStore();

// Show offline indicator
{!isOnline && <OfflineIndicator />}
```

## Testing

### API Testing
```typescript
// Test API connectivity
const isConnected = await networkService.testApiConnectivity();

// Test specific endpoints
const authTest = await apiService.login({ email: "test", password: "test" });
```

### Offline Testing
```typescript
// Simulate offline mode
useAuthStore.getState().setOnlineStatus(false);

// Test offline functionality
await useAuthStore.getState().login(email, password);
```

## Best Practices

1. **Always check online status** before making API calls
2. **Use store actions** instead of direct API calls
3. **Handle errors gracefully** with user feedback
4. **Test offline scenarios** thoroughly
5. **Monitor sync status** for user feedback

## Troubleshooting

### Common Issues

1. **API calls failing**
   - Check network connectivity
   - Verify API base URL
   - Check authentication token

2. **Sync not working**
   - Verify online status
   - Check for API errors
   - Review sync status in stores

3. **Data conflicts**
   - Check last-write-wins strategy
   - Review conflict resolution logic
   - Verify data integrity

### Debug Tools

```typescript
// Check store states
console.log('Auth:', useAuthStore.getState());
console.log('Scan:', useScanStore.getState());
console.log('Settings:', useSettingsStore.getState());
console.log('Analytics:', useAnalyticsStore.getState());

// Check network status
const isOnline = await networkService.checkConnectivity();
console.log('Online:', isOnline);
```

## Future Enhancements

1. **Real-time updates** using WebSockets
2. **Push notifications** for scan results
3. **Advanced sync strategies** (conflict resolution)
4. **Data compression** for large scan files
5. **Caching strategies** for better performance 