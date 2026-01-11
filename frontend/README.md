# 🌱 HydroGrow - Expo React Native App

> A modern, fully-typed React Native application for smart hydroponic farming, built with Expo Managed Workflow in 2025.

## ✨ What You Get

```
✅ Expo Managed Workflow (no native compilation needed)
✅ File-based routing (like Next.js)
✅ TypeScript throughout
✅ 8 reusable UI components
✅ Complete authentication flow
✅ API integration with Axios + WebSocket
✅ Tab navigation with Energy monitoring
✅ 15+ ready screens (setup flow, sensors, actuators, plants)
✅ ESP32 device integration
✅ Real-time sensor monitoring
✅ Production-ready patterns
✅ Comprehensive documentation
```

## 🚀 Quick Start (60 seconds)

### Step 1: Start Backend (in a new terminal)
```powershell
cd backend
& ".\.venv\Scripts\Activate.ps1"
& ".\.venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server runs on: http://localhost:8000/docs

### Step 2: Start Frontend (in another terminal)
```powershell
cd frontend
npm install  # if first time
npm start
# Press 'w' for web preview (or 'i' for iOS simulator, 'a' for Android)
```

### Step 3: Login
```
Email: farmer@example.com
Password: password123
```

**That's it!** You'll see the dashboard with plant cards. 🎉

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](QUICKSTART.md) | Get running in 2 minutes |
| [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) | Common code patterns |
| [SETUP.md](SETUP.md) | Detailed setup instructions |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Design & patterns |
| [DIAGRAMS.md](DIAGRAMS.md) | Visual flow diagrams |
| [CHECKLIST.md](CHECKLIST.md) | Implementation status |
| [COMPLETE_SUMMARY.md](COMPLETE_SUMMARY.md) | Full feature list |

## 🏗️ Project Structure

```
HydroGrow/
├── app/                         # Routes (files = routes)
│   ├── _layout.tsx             # Root with auth check
│   ├── onboarding.tsx          # Welcome screen
│   ├── (auth)/                 # Auth screens
│   │   ├── login.tsx           # Login form
│   │   └── register.tsx        # Registration
│   ├── (tabs)/                 # Main app tabs
│   │   ├── home.tsx            # Dashboard
│   │   ├── plants.tsx          # Plant management
│   │   ├── sensors.tsx         # Sensor data
│   │   ├── energy.tsx          # Energy monitoring
│   │   └── settings.tsx        # User settings
│   ├── setup-summary.tsx       # Setup summary
│   ├── shelves-identification.tsx  # Shelf selection
│   ├── seed-identification.tsx # Seed quality check
│   ├── sensors-check.tsx       # Sensor validation
│   ├── actuators-control.tsx   # Actuator control
│   ├── controls.tsx            # Main controls
│   ├── plant-details.tsx       # Plant info
│   ├── co2-grass-details.tsx   # CO2/grass monitoring
│   └── notifications.tsx       # Notifications
├── components/                  # Reusable UI
│   ├── InputField.tsx          # Text input
│   ├── CustomButton.tsx        # Buttons
│   ├── PlantCard.tsx           # Plant card
│   ├── ProgressBar.tsx         # Progress bar
│   ├── SensorCard.tsx          # Sensor display
│   ├── SeedQualityCard.tsx     # Seed quality
│   ├── ShelfSelectionCard.tsx  # Shelf picker
│   └── TraySlotCard.tsx        # Tray slot info
├── services/                    # API & auth
│   ├── api.ts                  # Axios instance
│   └── authService.ts          # Auth logic
├── constants/                   # Constants
│   └── Colors.ts               # Color palette
└── config/                      # Config
    └── firebaseConfig.ts       # Firebase
```

## 🎯 Core Features

### ✅ Authentication
- JWT-based login/register
- Test credentials pre-filled
- Automatic token persistence
- Auto-login on app restart

### ✅ Navigation
- Bottom tab bar (Home, Plants, Sensors, Settings)
- Conditional auth/app stacks
- No routing boilerplate needed

### ✅ UI Components
- Input fields with icons
- Multi-variant buttons
- Plant cards with progress
- Progress bars
- Sensor status cards
- Seed quality cards
- Shelf selection cards
- Tray slot management cards

### ✅ API Integration
- Connected to FastAPI backend
- WebSocket support for real-time data
- ESP32 device communication
- Automatic token injection
- Error handling & user feedback
- AsyncStorage for persistence

### ✅ Setup & Onboarding
- Complete setup flow (shelves, sensors, seeds)
- Sensor validation and testing
- Tray and slot identification
- Setup progress tracking
- Configuration summary

### ✅ Device Control
- ESP32 actuator control
- Real-time sensor monitoring
- Energy consumption tracking
- CO2 and environmental monitoring
- Device discovery and management

## 📱 Supported Platforms

| Platform | Support | Command |
|----------|---------|---------|
| Web | ✅ Full | `npm run web` |
| iOS | ✅ Full | `npm run ios` |
| Android | ✅ Full | `npm run android` |
| Device | ✅ Full | Scan QR code |

## 🔧 Available Commands

```bash
npm start              # Start Expo dev server
npm run web            # Open in web browser
npm run ios            # iOS simulator
npm run android        # Android emulator
npm test               # Run tests
npm run build:web      # Production web build
expo build:web         # EAS web build
expo build:android     # EAS Android build
expo build:ios         # EAS iOS build
```

## 💾 Architecture Overview

```
User Interface (React Components)
            ↓
    Services Layer (API calls)
            ↓
    Axios Instance (HTTP client)
            ↓
    FastAPI Backend (localhost:8000)
            ↓
    Database (in-memory demo)
```

**Key Patterns:**
- No Redux (too heavy)
- React Hooks for local state
- AsyncStorage for auth tokens
- Axios interceptors for headers
- Error handling at every level

## 🔐 Authentication Flow

```
1. User fills login form
   ↓
2. POST /api/login → FastAPI
   ↓
3. Receive JWT token
   ↓
4. Save to AsyncStorage
   ↓
5. Inject in Authorization header
   ↓
6. Navigate to Dashboard
   ↓
7. Token restored on app restart
```

## 🎨 Styling Approach

- **Color System**: Centralized in `constants/Colors.ts`
- **StyleSheet.create()**: Pre-compiled for performance
- **No CSS/Tailwind**: React Native doesn't need it
- **Responsive**: Works on all screen sizes
- **Safe Areas**: Handles notches & bezels

## 📊 Component Library

### InputField
```typescript
<InputField
  label="Email"
  placeholder="Enter email"
  value={email}
  onChangeText={setEmail}
  icon={<Icon />}
/>
```

### CustomButton
```typescript
<CustomButton
  title="Login"
  loading={isLoading}
  variant="primary"
  onPress={handlePress}
/>
```

### PlantCard
```typescript
<PlantCard
  plantName="Rice"
  day={5}
  progress={52}
  status="Growing"
/>
```

### ProgressBar
```typescript
<ProgressBar progress={52} />
```

### SensorCard
```typescript
<SensorCard
  sensorType="Temperature"
  value="25°C"
  status="Normal"
  lastUpdate="2 min ago"
/>
```

### SeedQualityCard
```typescript
<SeedQualityCard
  seedType="Rice"
  quality="High"
  germination={95}
/>
```

### ShelfSelectionCard
```typescript
<ShelfSelectionCard
  shelfNumber={1}
  capacity={12}
  selected={true}
  onSelect={handleSelect}
/>
```

### TraySlotCard
```typescript
<TraySlotCard
  trayId="T1"
  slotNumber={3}
  occupied={true}
  plantName="Lettuce"
/>
```

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Purpose |
|--------|----------|---------||
| POST | `/api/login` | Login |
| POST | `/api/register` | Register |
| GET | `/api/me` | Get profile |

### Plants & Sensors
| Method | Endpoint | Purpose |
|--------|----------|---------||
| GET | `/api/items` | Get plants |
| GET | `/api/sensors` | Get sensor data |
| GET | `/api/sensors/{id}` | Get specific sensor |

### ESP32 Devices
| Method | Endpoint | Purpose |
|--------|----------|---------||
| GET | `/api/devices` | List devices |
| POST | `/api/actuators/control` | Control actuator |
| WS | `/ws/gateway` | WebSocket for real-time |

## 🧪 Test Data

Default account (already in backend):
```
Email: farmer@example.com
Password: password123
```

Or register a new account in-app!

## ⚙️ Configuration

### API Base URL
```typescript
// services/api.ts
const API_BASE_URL = 'http://localhost:8000';
```

### Firebase (Optional)
```typescript
// config/firebaseConfig.ts
export const firebaseConfig = {
  apiKey: 'YOUR_KEY',
  // ...
};
```

### Colors
```typescript
// constants/Colors.ts
export default {
  primary: '#0D9488',  // Teal
  secondary: '#064E3B', // Dark teal
  // ...
};
```

## 🚨 Troubleshooting

**Metro Bundler Error:**
```bash
npm start -- --clear
```

**Port 8081 in use:**
```bash
npx kill-port 8081
```

**Cannot connect to API:**
1. Check backend is running: `http://localhost:8000/healthz`
2. Check firewall settings
3. For Android emulator, use `10.0.2.2` instead of `localhost`

**Package issues:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Deployment Path

### Development
```bash
npm start          # Local development
npm run web        # Test in browser
```

### Production
```bash
expo build:web     # Web hosting
expo build:ios     # App Store
expo build:android # Play Store
```

## 📈 Performance Notes

- ✅ Hot reload enabled
- ✅ Code splitting automatic
- ✅ Lazy loading configured
- ✅ Images optimized
- ✅ No unnecessary re-renders

## 🔒 Security

### Current (Development)
- JWT tokens in AsyncStorage
- Automatic header injection
- Password fields masked
- CORS enabled

### Production Checklist
- [ ] HTTPS/TLS enabled
- [ ] Secure token storage
- [ ] Token refresh logic
- [ ] Input sanitization
- [ ] Rate limiting
- [ ] Environment variables

## 📖 Learning Resources

- **Official**: [Expo Docs](https://docs.expo.dev)
- **Routing**: [Expo Router](https://docs.expo.dev/routing/)
- **React Native**: [React Native Docs](https://reactnative.dev)
- **Backend**: [FastAPI](https://fastapi.tiangolo.com)
- **HTTP**: [Axios](https://axios-http.com)

## 💡 Pro Tips

1. **Hot Reload**: Changes auto-reload while coding
2. **TypeScript**: Catch errors before runtime
3. **Prettier**: Auto-format on save
4. **Expo Go**: Test on real device instantly
5. **DevTools**: F12 in web preview for debugging

## 🤝 Contributing

When adding features:
1. Keep components reusable
2. Separate UI from logic
3. Add error handling
4. Update documentation
5. Test on web + device

## 📞 Support

- Check documentation files
- Review ARCHITECTURE.md for patterns
- Look at existing screens for examples
- Check backend API docs: `http://localhost:8000/docs`

## 📄 License

MIT

---

## 🎯 Quick Navigation

- **New to the project?** → Read [QUICKSTART.md](QUICKSTART.md)
- **Want to code?** → Read [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- **Need to understand architecture?** → Read [ARCHITECTURE.md](ARCHITECTURE.md)
- **Want to see what's done?** → Read [CHECKLIST.md](CHECKLIST.md)
- **Need visual diagrams?** → Read [DIAGRAMS.md](DIAGRAMS.md)

---

**Status**: ✅ Ready for development

**Last Updated**: January 11, 2026

**Version**: 1.5.0

---

Made with 🌱 for Sri Lankan farmers
