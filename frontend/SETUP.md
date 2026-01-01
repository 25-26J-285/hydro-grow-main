# HydroGrow - Expo React Native Setup

This is the complete Expo-based React Native setup for HydroGrow, a smart hydroponic monitoring system.

## Project Structure

```
HydroGrow/
├── app/                        # Expo Router - File-based routing
│   ├── _layout.tsx             # Root layout with auth state management
│   ├── onboarding.tsx          # Onboarding screen
│   ├── (auth)/                 # Auth group
│   │   ├── _layout.tsx         # Auth stack layout
│   │   ├── login.tsx           # Login screen
│   │   └── register.tsx        # Registration screen
│   └── (tabs)/                 # Main app tabs
│       ├── _layout.tsx         # Tab bar configuration
│       ├── home.tsx            # Dashboard
│       ├── plants.tsx          # Plants management
│       ├── sensors.tsx         # Sensor data
│       └── settings.tsx        # Settings
├── components/                 # Reusable UI components
│   ├── InputField.tsx          # Text input with labels
│   ├── CustomButton.tsx        # Customizable buttons
│   ├── PlantCard.tsx           # Plant card component
│   ├── ProgressBar.tsx         # Progress bar
│   └── index.ts                # Component exports
├── services/                   # API and auth services
│   ├── api.ts                  # Axios instance + API endpoints
│   └── authService.ts          # Authentication logic with AsyncStorage
├── config/                     # Configuration files
│   └── firebaseConfig.ts       # Firebase initialization
├── constants/                  # App-wide constants
│   └── Colors.ts               # Color palette
└── assets/                     # Images and fonts
```

## Installation & Setup

### Prerequisites
- Node.js 18+ (with npm)
- Expo CLI: `npm install -g expo-cli`
- Python 3.10+ (for FastAPI backend)

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on web (for development):**
   ```bash
   npm run web
   ```

   Or use Expo CLI:
   ```bash
   expo start --web
   ```

4. **Run on iOS/Android:**
   - iOS: `npm run ios` (requires macOS)
   - Android: `npm run android`
   - Or scan QR code with Expo Go app on your phone

### Backend Setup

The app connects to a FastAPI backend running on `http://localhost:8000`.

1. **Navigate to backend:**
   ```bash
   cd ../backend  # From the hydro-grow-main folder
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install fastapi uvicorn python-dotenv pydantic
   ```

4. **Start the server:**
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

   Or use the startup script:
   ```bash
   .\..\start-backend.ps1  # Windows PowerShell
   ```

## Key Features Implemented

### Authentication
- JWT-based authentication
- Email/password login and registration
- Token persistence using AsyncStorage
- Automatic login state restoration on app start

### Navigation
- Expo Router for file-based routing
- Auth stack for unauthenticated users
- Tab navigation for authenticated users
- Conditional rendering based on auth state

### Components
- **InputField**: Reusable text input with icons and error messages
- **CustomButton**: Multi-variant button (primary, secondary, outline)
- **PlantCard**: Displays plant information with progress tracking
- **ProgressBar**: Customizable progress indicator

### API Integration
- Axios instance with auto-token injection
- Error handling and user feedback
- AsyncStorage for persistent authentication

## Testing

### Default Credentials
- **Email:** farmer@example.com
- **Password:** password123

### API Endpoints (when backend is running)
- Login: `POST /api/login`
- Register: `POST /api/register`
- Get Profile: `GET /api/me`
- Get Items: `GET /api/items`

View API docs: `http://localhost:8000/docs`

## Environment Configuration

### API Base URL
Currently hardcoded to `http://localhost:8000` in [services/api.ts](services/api.ts).

To change:
```typescript
const API_BASE_URL = 'http://your-api-url:port';
```

### Firebase (Optional)
Update credentials in [config/firebaseConfig.ts](config/firebaseConfig.ts) to enable Firebase features.

## Development Tips

### Hot Reloading
- Changes to components auto-reload
- Use `r` in terminal to refresh
- Use `w` to open web preview

### Debugging
- Use React DevTools: `npm install -g @react-navigation/devtools`
- Check console: `npm start` shows logs

### Common Commands
```bash
npm start              # Start Expo development server
npm run web            # Run on web browser
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm test               # Run tests
npm run build          # Build for production
```

## Troubleshooting

### "Cannot connect to localhost:8000"
- Ensure backend is running on the correct port
- Check firewall settings
- For Android emulator, use `10.0.2.2` instead of `localhost`

### TypeScript errors
- Run `npm run lint` to check for issues
- Ensure all imports are resolved
- Check `.vscode/settings.json` for formatter settings

### AsyncStorage not working
- Ensure `@react-native-async-storage/async-storage` is installed
- On web, it falls back to localStorage automatically

## Production Deployment

Before deploying:
1. Update API base URL to production server
2. Update Firebase credentials
3. Remove default test credentials
4. Enable HTTPS
5. Set up environment variables

```bash
expo build:web    # Build optimized web version
expo build:ios    # Build for iOS App Store
expo build:android # Build for Google Play Store
```

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [Expo Router](https://docs.expo.dev/routing/introduction/)
- [React Native Documentation](https://reactnative.dev)
- [FastAPI Documentation](https://fastapi.tiangolo.com)

## License

MIT
