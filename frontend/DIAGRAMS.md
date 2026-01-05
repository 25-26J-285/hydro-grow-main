# HydroGrow - Visual Architecture & Flow Diagrams

## App Navigation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    App Initialization                         │
│              (app/_layout.tsx - Root Layout)                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─→ authService.initialize()
                 │   └─→ Restore token from AsyncStorage
                 │
                 └─→ Check isLoggedIn = !!token
                     │
                     ├─→ IF TRUE: Render App Stack
                     │   │
                     │   └─→ (tabs) Navigation
                     │       ├─ home.tsx (Dashboard)
                     │       ├─ plants.tsx
                     │       ├─ sensors.tsx
                     │       └─ settings.tsx
                     │
                     └─→ IF FALSE: Render Auth Stack
                         │
                         ├─→ onboarding.tsx
                         │   └─ Skip or Get Started
                         │
                         └─→ (auth) Stack
                             ├─ login.tsx
                             └─ register.tsx
```

## Authentication Flow

```
┌──────────────────┐
│   Login Screen   │
│   (pre-filled)   │
└────────┬─────────┘
         │
         ├─→ User clicks "Sign In"
         │
         ├─→ handleLogin()
         │   ├─ Validate inputs
         │   └─ Set loading = true
         │
         └─→ authService.login(email, password)
             │
             └─→ api.post('/api/login', {...})
                 │
                 ├─→ FastAPI Backend
                 │   ├─ Verify credentials
                 │   └─ Return JWT token
                 │
                 ├─→ Response: {access_token, user}
                 │
                 ├─→ AsyncStorage.setItem(TOKEN_KEY, token)
                 │
                 ├─→ setAuthToken(token)  ← Auto-inject in headers
                 │
                 └─→ router.replace('/(tabs)/home')
                     │
                     └─→ Dashboard loaded with plant data
```

## Component Hierarchy

```
App (_layout.tsx)
│
├─ (if logged in) → Tabs (_layout.tsx)
│                   │
│                   ├─ Home Screen
│                   │  ├─ PlantCard
│                   │  │  └─ ProgressBar
│                   │  └─ PlantCard
│                   │     └─ ProgressBar
│                   │
│                   ├─ Plants Screen
│                   │
│                   ├─ Sensors Screen
│                   │
│                   └─ Settings Screen
│
└─ (if NOT logged in) → Auth Stack
                        │
                        ├─ Onboarding
                        │  └─ CustomButton
                        │
                        ├─ Login
                        │  ├─ InputField
                        │  ├─ CustomButton
                        │  └─ CustomButton
                        │
                        └─ Register
                           ├─ InputField
                           ├─ InputField
                           └─ CustomButton
```

## Data Flow - Login to Dashboard

```
User Input (email, password)
    │
    ↓
LoginScreen Component
    │
    ├─→ State: email, password, loading
    │
    └─→ handleLogin()
        │
        ├─→ authService.login(email, password)
        │   │
        │   ├─→ api.post('/api/login', {...})
        │   │   │
        │   │   └─→ Axios Interceptor
        │   │       └─→ Sends Authorization header
        │   │
        │   ├─→ Save token: AsyncStorage.setItem()
        │   │
        │   └─→ Update axios headers: setAuthToken()
        │
        └─→ Navigation: router.replace('/(tabs)/home')
            │
            ├─→ Home Screen mounted
            │   │
            │   ├─→ useEffect: call authAPI.getItems()
            │   │   │
            │   │   └─→ Axios auto-includes token header
            │   │
            │   ├─→ Response: {items: [...]}
            │   │
            │   └─→ Render PlantCard for each item
            │       └─→ Show progress, status, etc.
            │
            └─→ User sees dashboard
```

## Service Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Screens (Components)                │
│          (LoginScreen, Dashboard, etc.)              │
└────────────────┬────────────────────────────────────┘
                 │
                 │ Import & Call
                 ↓
         ┌───────────────────────────────┐
         │    authService.ts             │
         │  ├─ login()                  │
         │  ├─ register()               │
         │  ├─ logout()                 │
         │  ├─ getToken()               │
         │  └─ initialize()             │
         │         ↓                    │
         │  AsyncStorage (Browser/Phone) │
         └────┬────────────────────────┘
              │
              │ Use
              ↓
         ┌─────────────────────────────────┐
         │        api.ts                    │
         │  ├─ axios instance              │
         │  ├─ authAPI.login()             │
         │  ├─ authAPI.register()          │
         │  ├─ authAPI.getProfile()        │
         │  └─ setAuthToken() interceptor │
         │         ↓                      │
         │  ┌──────────────────────────┐ │
         │  │  Authorization Header    │ │
         │  │  Bearer {access_token}   │ │
         │  └──────────────────────────┘ │
         └────┬──────────────────────────┘
              │
              │ HTTP Request
              ↓
         ┌────────────────────────────────┐
         │   FastAPI Backend              │
         │   (http://localhost:8000)      │
         │  ├─ /api/login                 │
         │  ├─ /api/register              │
         │  ├─ /api/me                    │
         │  └─ /api/items                 │
         └────────────────────────────────┘
```

## State Management Pattern

```
Component Level State:
  const [email, setEmail] = useState('farmer@example.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  └─→ Manage form inputs & UI feedback

App Level State:
  authService.initialize() → Check token
  ├─→ If exists: isLoggedIn = true → Show App
  └─→ If missing: isLoggedIn = false → Show Auth Stack

Persistent State:
  AsyncStorage.setItem(TOKEN_KEY, token)
  └─→ Survives app restart

API State:
  authAPI.getItems() → Fetch from backend
  └─→ setItems(response.data.items)
```

## Error Handling Flow

```
User Action (e.g., Login)
    │
    ├─→ Try/Catch Block
    │   │
    │   ├─ Success:
    │   │  └─→ Save token
    │   │      └─→ Navigate to app
    │   │
    │   └─ Error:
    │      │
    │      ├─ API Error:
    │      │  └─ error.response?.data?.detail
    │      │
    │      ├─ Network Error:
    │      │  └─ "Could not connect to server"
    │      │
    │      └─ Validation Error:
    │         └─ "Please fill in all fields"
    │
    └─→ Alert.alert('Error Title', 'Error Message')
        └─→ User sees friendly message & can retry
```

## Token Lifecycle

```
1. User logs in
   └─→ Receive JWT token from server
       └─→ Token = eyJhbGciOiJIUzI1NiI...

2. Save token
   └─→ AsyncStorage.setItem('hydro_grow_token', token)

3. On every API request
   └─→ Axios Interceptor
       └─→ Authorization: Bearer {token}
           └─→ Server validates token
               └─→ Return requested data

4. Token expires (30 min default)
   └─→ Server returns 401 Unauthorized
       └─→ app catches error
           └─→ Clear token
               └─→ Redirect to login

5. User logout
   └─→ authService.logout()
       ├─→ AsyncStorage.removeItem(TOKEN_KEY)
       ├─→ setAuthToken(null)  ← Remove from headers
       └─→ Navigation: router.replace('/onboarding')
```

## Component Data Flow (PlantCard Example)

```
Dashboard Screen
  ├─ State: items = [{id: 1, name: 'Rice', ...}, ...]
  │
  └─ items.map(item =>
     │
     └─→ <PlantCard
         ├─ plantName={item.name}
         ├─ day={5}
         ├─ progress={52}
         ├─ status={item.status}
         └─ onPress={() => Alert.alert(item.name)}
            │
            └─→ PlantCard renders
                ├─ Text: "Shelf 01 - Rice Plant"
                ├─ Progress: 52%
                ├─ Stages: Germination → Sprout → Seedling → Plant
                └─ TouchableOpacity for press
                   └─→ onPress() called on tap
```

## File-Based Routing (Expo Router)

```
File Structure                    Routes
─────────────                     ──────
app/
├── _layout.tsx              → Root layout (always loaded)
├── index.tsx                → / (redirects)
├── onboarding.tsx           → /onboarding
├── (auth)/
│   ├── _layout.tsx          → Auth stack layout
│   ├── login.tsx            → /(auth)/login
│   └── register.tsx         → /(auth)/register
└── (tabs)/
    ├── _layout.tsx          → Tab bar + routes
    ├── home.tsx             → /(tabs)/home
    ├── plants.tsx           → /(tabs)/plants
    ├── sensors.tsx          → /(tabs)/sensors
    └── settings.tsx         → /(tabs)/settings

Automatic routing: File path = URL path
No route declarations needed
Groups with () don't appear in URL
```

## Development Workflow

```
┌──────────────────────────────────────────────────┐
│ npm start                                        │
│ ├─ Metro Bundler starts                        │
│ ├─ Watches for file changes                    │
│ └─ Ready for mobile/web testing                │
└────────┬─────────────────────────────────────┘
         │
    ┌────┴────────────────────────────────┐
    │ Choose platform:                     │
    ├─ w: Web (localhost:8081)            │
    ├─ a: Android Emulator                │
    ├─ i: iOS Simulator                   │
    └─ Scan: Expo Go on phone             │
         │
         ├─ Edit file: app/(tabs)/home.tsx
         │ └─ Save
         │    └─ Metro rebuilds (hot reload)
         │       └─ Instant update on device
         │
         └─ Change route: Add new file
             └─ app/(tabs)/mynewscreen.tsx
                └─ Automatic route created
                   └─ Add to tab bar in _layout.tsx
                      └─ New tab appears
```

## API Contract (Frontend ↔ Backend)

```
Frontend (Axios)                Backend (FastAPI)
─────────────────               ─────────────────

POST /api/login                 Login Endpoint
  Body:                         Receives:
  {                             • email
    email: string               • password
    password: string            Validates & Returns:
  }                             {
  Response:                       access_token: JWT
  {                               token_type: "bearer"
    access_token: string          user: {email, fullname}
    token_type: "bearer"        }
    user: {
      email: string
      fullname: string
    }
  }

GET /api/items                  Items Endpoint
  Headers:                      Requires:
  Authorization: Bearer TOKEN   • Valid JWT in header
  Response:                     Returns:
  {                             {
    items: [{                     items: [
      id: number                    {id, name, status, ph}
      name: string                ]
      status: string            }
      ph: number
    }]
  }
```

---

These diagrams show how all components work together. The key takeaway: **Simple, unidirectional data flow from UI → Services → API → Backend → Response → Update UI**.
