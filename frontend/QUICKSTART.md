# HydroGrow Expo - Quick Start Guide

## What Was Set Up

You now have a complete Expo-based React Native application with:
- ✅ **Expo Router** for file-based routing
- ✅ **TypeScript** support
- ✅ **Reusable Components** (Button, Input, PlantCard, ProgressBar)
- ✅ **Authentication Service** with AsyncStorage persistence
- ✅ **API Integration** with Axios
- ✅ **Tab Navigation** for the main app
- ✅ **Auth Stack** for login/register flows
- ✅ **Onboarding Screen** for new users

## File Structure Summary

```
HydroGrow/
├── app/                           # Routes (each file = a route)
│   ├── _layout.tsx               # Root layout + auth check
│   ├── onboarding.tsx            # Welcome screen
│   ├── (auth)/                   # Auth group (login/register)
│   └── (tabs)/                   # Main app (home/plants/sensors/settings)
├── components/                    # Reusable UI components
├── services/                      # API calls & auth logic
├── constants/                     # Colors & global constants
└── config/                        # Firebase & configuration
```

## Starting the App

### Terminal 1: Start Backend (FastAPI)
```powershell
cd c:\Users\sudeepa\Desktop\Research app\hydro-grow-main\backend
.\venv\Scripts\activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Terminal 2: Start Frontend (Expo)
```powershell
cd "c:\Users\sudeepa\Desktop\Research app\HydroGrow"
npm start
```

Then press:
- `w` to open in web browser
- `a` to run on Android emulator
- `i` to run on iOS simulator
- `r` to reload

## Default Test Credentials

When the app starts, you'll see:
1. **Onboarding Screen** → Click "Get Started"
2. **Login Screen** (auto-filled with test credentials):
   - Email: `farmer@example.com`
   - Password: `password123`
3. **Dashboard** → Shows hydroponic plant cards

## Key Features

### 1. Authentication Flow
- **Login/Register** with FastAPI backend
- **Auto-login** - token restored from storage on app start
- **Logout** - clears auth state

### 2. Dashboard Screen
- Displays plant cards from `/api/items`
- Shows growth progress with progress bars
- Click "Add" to add new plants (coming soon)

### 3. Tab Navigation
- **Home** → Dashboard with plant cards
- **Plants** → Plant management (stub)
- **Sensors** → Sensor data (stub)
- **Settings** → User settings (stub)

### 4. Reusable Components
```typescript
// Use these anywhere:
<InputField label="Email" placeholder="..." icon={...} />
<CustomButton title="Login" loading={loading} onPress={...} />
<PlantCard plantName="Rice" day={5} progress={52} status="Growing" />
<ProgressBar progress={52} />
```

## API Endpoints (Backend Required)

The app expects these endpoints at `http://localhost:8000`:

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/login` | `{ email, password }` |
| POST | `/api/register` | `{ email, password, fullname }` |
| GET | `/api/me` | (requires token) |
| GET | `/api/items` | (requires token) |

## Making Changes

### Add a New Component
```typescript
// components/MyComponent.tsx
import React from 'react';
import { View } from 'react-native';

export const MyComponent: React.FC = () => {
  return <View>{/* JSX */}</View>;
};

// Export in components/index.ts
export { MyComponent } from './MyComponent';
```

### Add a New Screen
```typescript
// app/(tabs)/mynewscreen.tsx
export default function MyScreen() {
  return <View>{/* JSX */}</View>;
}

// It automatically appears in the tab bar after adding to _layout.tsx
```

### Update API Endpoints
Edit [services/api.ts](services/api.ts):
```typescript
export const authAPI = {
  myNewEndpoint: () => api.get('/api/my-endpoint'),
};
```

## Environment Variables

To use environment variables, create a `.env` file:
```
API_URL=http://localhost:8000
FIREBASE_API_KEY=your_key_here
```

Then install dotenv:
```bash
npm install react-native-dotenv
```

## Troubleshooting

### Metro Bundler Error
If you see bundler errors, clear cache:
```bash
npm start -- --clear
```

### Port 8081 in use
```bash
npx kill-port 8081
```

### Dependencies mismatch warning
The warnings about package versions are safe to ignore - Expo handles compatibility.

### Android Emulator on Windows
If using Android emulator with localhost API, use `10.0.2.2` instead:
```typescript
const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8000' 
  : 'http://localhost:8000';
```

## Next Steps

1. ✅ Start both backend and frontend servers
2. ✅ Test login/register flows
3. ✅ Add more plant cards via the API
4. ✅ Build out Plants, Sensors, Settings screens
5. ✅ Add real Firebase auth (optional)
6. ✅ Deploy to Expo hosting or your own server

## Useful Commands

```bash
npm start              # Start development server
npm run web            # Open web preview
npm run android        # Run on Android emulator
npm run ios            # Run on iOS simulator
npm run build:web      # Build for web
expo build:web         # Production web build
npm test               # Run tests (if configured)
```

## Documentation

- Full setup: [SETUP.md](SETUP.md)
- Copilot instructions: [../hydro-grow-main/.github/copilot-instructions.md](../.github/copilot-instructions.md)

---

**Happy coding!** 🌱🚀
