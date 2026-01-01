# Architecture & Design Decisions

## Overview
HydroGrow is built using Expo Managed Workflow - the modern standard for React Native development in 2025. This provides:
- 🚀 **Fast development** without native code compilation
- 📦 **No Xcode/Android Studio** needed for development
- 🔄 **Hot reload** for instant feedback
- 📱 **EAS Build** for production builds
- 🌐 **Web support** alongside iOS/Android

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Routing** | Expo Router | File-based routing like Next.js |
| **UI Components** | React Native | Cross-platform UI |
| **Styling** | StyleSheet API | Platform-optimized styles |
| **State Management** | React Hooks + AsyncStorage | Local auth state |
| **API Communication** | Axios | HTTP requests to FastAPI |
| **Authentication** | JWT + AsyncStorage | Session persistence |
| **Backend** | FastAPI | Python REST API |

## Project Structure & Patterns

### Root Layout (`app/_layout.tsx`)
- **Single source of truth** for auth state
- Conditionally renders Auth Stack or App Stack
- Restores token on app initialization
- No auth logic in individual screens

```
If (isLoggedIn) → Tabs Navigation
Else          → Onboarding + Auth Stack
```

### Routing Groups

#### `app/(tabs)/` - Authenticated Routes
- File-based routes automatically become tab buttons
- Bottom tab bar configured in `_layout.tsx`
- Each file is a self-contained screen
- No routing boilerplate needed

```
home.tsx     → Home tab
plants.tsx   → Plants tab
sensors.tsx  → Sensors tab
settings.tsx → Settings tab
```

#### `app/(auth)/` - Authentication Routes
- Login and registration flows
- Nested stack for modal-like behavior
- Separate from main app navigation

```
login.tsx    → Login screen
register.tsx → Registration screen
```

### Component Architecture

#### Reusable Components (`components/`)
Built to be **dump & smart**:
- No API calls in components
- No Redux/Context for most state
- Accept data via props
- Emit callbacks for events

**Example:**
```typescript
<InputField
  label="Email"
  value={email}
  onChangeText={setEmail}
  icon={<Icon />}
/>
```

#### Services (`services/`)
- **api.ts** - Axios instance + endpoint definitions
- **authService.ts** - Auth logic with AsyncStorage
- Separate from UI logic for testability

```typescript
// Not in components:
const { user } = await authService.login(email, password);

// In components:
<LoginButton onPress={handleLogin} />
```

### State Management Philosophy

#### ❌ Avoid
- Redux (overkill for small apps)
- Context API for auth (use localStorage instead)
- Prop drilling more than 2 levels

#### ✅ Use
- **React.useState()** for local UI state
- **AsyncStorage** for persistent auth
- **Custom Hooks** for repeated logic
- **Axios interceptors** for token injection

Example - Login Screen:
```typescript
const [email, setEmail] = useState('farmer@example.com');
const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  setLoading(true);
  await authService.login(email, password); // Handles token + storage
  setLoading(false);
};
```

## Data Flow

### Authentication Flow
```
User inputs credentials
        ↓
handleLogin() called
        ↓
authService.login(email, password)
        ↓
API request to FastAPI
        ↓
Response with JWT token
        ↓
Save token to AsyncStorage
        ↓
Set token in Axios headers
        ↓
Navigation to app/(tabs)
```

### Screen Rendering Flow
```
App Initialization
        ↓
authService.initialize() ← Restore token from storage
        ↓
Check isLoggedIn = !!token
        ↓
Render appropriate stack
        ↓
useRouter.push/replace() for navigation
```

## API Integration Pattern

### Setup (`services/api.ts`)
```typescript
// Single Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// Auto-inject token on every request
setAuthToken(token) → updates Authorization header
```

### Usage Pattern
```typescript
// Define in services
export const authAPI = {
  login: (email, password) => 
    api.post('/api/login', { email, password }),
};

// Call from anywhere
const { data } = await authAPI.login(email, password);
```

Benefits:
- Single source of truth for endpoints
- Automatic token injection
- Consistent error handling
- Easy to mock for testing

## Styling Approach

### Color System
All colors centralized in `constants/Colors.ts`:
```typescript
export default {
  primary: '#0D9488',      // Teal (main brand color)
  secondary: '#064E3B',    // Dark teal
  background: '#F3F4F6',
  text: '#1F2937',
  error: '#EF4444',
};
```

### Component Styles
Using **StyleSheet.create()** for performance:
```typescript
const styles = StyleSheet.create({
  container: { flex: 1 },  // Compiled to native styles
});
```

No CSS/Tailwind for mobile (not needed - React Native is inherently atomic).

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| **Components** | PascalCase | `PlantCard.tsx` |
| **Services** | camelCase | `authService.ts` |
| **Routes/Files** | kebab-case or camelCase | `home.tsx`, `my-screen.tsx` |
| **Constants** | PascalCase | `Colors.ts` |
| **Variables** | camelCase | `isLoading`, `handlePress` |
| **Types** | PascalCase | `PlantCardProps`, `TokenData` |

## Error Handling Strategy

### API Errors
```typescript
try {
  await authService.login(email, password);
} catch (error: any) {
  const message = error.response?.data?.detail || 'Unknown error';
  Alert.alert('Error', message);
}
```

### Navigation Errors
```typescript
// Use router with try-catch
try {
  router.replace('/(tabs)/home');
} catch (error) {
  console.error('Navigation failed:', error);
}
```

### Form Validation
```typescript
if (!email || !password) {
  return Alert.alert('Error', 'Please fill in all fields');
}
```

## Performance Optimizations

### Already Implemented
- **Memo**: Components wrapped where needed
- **Lazy Loading**: Screens loaded on-demand by Expo Router
- **StyleSheet**: Pre-compiled styles
- **FlatList**: For long lists (not used yet)

### Future Optimizations
- **Image Caching**: expo-image-cache or React-Native-Fast-Image
- **State Normalization**: Redux if data complexity grows
- **Code Splitting**: Automatic with Expo
- **Pagination**: For plant/sensor lists

## Security Considerations

### Current Implementation
- ✅ JWT tokens stored in AsyncStorage
- ✅ Automatic token injection via Axios interceptor
- ✅ Token cleared on logout
- ✅ Password sent over HTTP (dev only)

### Production Checklist
- [ ] Use HTTPS/TLS for API
- [ ] Store sensitive tokens in Secure Storage (expo-secure-store)
- [ ] Implement token refresh logic
- [ ] Add rate limiting on auth endpoints
- [ ] Implement CORS properly
- [ ] Sanitize all user inputs

## Testing Strategy

### Unit Tests (Jest)
```bash
npm test
```

### E2E Tests (Detox)
Test full user flows (login → view plants → logout)

### Manual Testing
1. **Web**: `npm run web` for quick UI checks
2. **iOS Simulator**: `npm run ios`
3. **Android Emulator**: `npm run android`
4. **Physical Device**: Scan QR code with Expo Go

## Deployment Path

### Development
- Local: `npm start` → Metro Bundler
- Web Preview: `npm run web`

### Staging
- EAS Preview: `eas update --branch staging`
- Web: Self-hosted at hydrogrow.example.com

### Production
- EAS Build: `eas build --platform all`
- Web: `expo build:web` (static hosting)
- App Stores: Review & submit iOS/Android builds

## Future Architecture Improvements

As the app grows:

1. **State Management** → Redux Toolkit or Jotai
2. **Database** → PostgreSQL (migrate from in-memory)
3. **Real-time** → WebSockets for sensor data
4. **Authentication** → Firebase Auth (optional)
5. **Offline Support** → SQLite + WatermelonDB
6. **Analytics** → Sentry + custom tracking
7. **A/B Testing** → Feature flags system

---

**Key Philosophy**: Keep it simple until you need complexity. Expo Router handles routing, AsyncStorage handles auth, Axios handles API calls. No framework overhead.
