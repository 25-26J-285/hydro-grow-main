# HydroGrow - Developer Quick Reference

## 🚀 Get Started in 30 Seconds

```bash
# Terminal 1: Backend
cd ../hydro-grow-main/backend
.\venv\Scripts\activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Frontend
cd HydroGrow
npm start
# Press 'w' for web preview
```

**Test Account:**
```
Email: farmer@example.com
Password: password123
```

## 📂 Where Everything Lives

| What | Where |
|------|-------|
| Routing/Screens | `app/` (files are routes) |
| Reusable Buttons/Inputs | `components/` |
| Login/API Logic | `services/` |
| Colors & Constants | `constants/` |
| Firebase Config | `config/` |

## 🎨 Add a New Screen in 30 Seconds

```typescript
// 1. Create file: app/(tabs)/mynewscreen.tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function MyScreen() {
  return (
    <View>
      <Text>My New Screen</Text>
    </View>
  );
}

// 2. Add to tab bar in app/(tabs)/_layout.tsx
<Tabs.Screen
  name="mynewscreen"
  options={{
    title: 'My Screen',
    tabBarIcon: ({ color }) => (
      <Ionicons name="star" size={24} color={color} />
    ),
  }}
/>

// Done! Screen now appears as a tab.
```

## 🔌 Use a Component

```typescript
import { InputField, CustomButton, PlantCard } from '../components';

// Input
<InputField
  label="Email"
  placeholder="Enter email"
  value={email}
  onChangeText={setEmail}
  icon={<MaterialIcons name="email" size={20} />}
/>

// Button
<CustomButton
  title="Submit"
  loading={isLoading}
  onPress={handlePress}
  variant="primary"  // or "secondary", "outline"
/>

// Plant Card
<PlantCard
  plantName="Rice"
  shelf="Shelf 01"
  day={5}
  progress={52}
  status="Growing"
  onPress={() => Alert.alert('Tapped!')}
/>
```

## 🌐 Call the API

```typescript
import { authAPI } from '../services/api';
import { authService } from '../services/authService';

// Login
const { token, user } = await authService.login(email, password);
// Token auto-saved to AsyncStorage

// Get items
const response = await authAPI.getItems();
const items = response.data.items;

// Get user profile
const profile = await authAPI.getProfile();
```

## 🔒 Handle Authentication

```typescript
// In any screen:
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { authService } from '../services/authService';

export default function MyScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      const currentUser = await authService.getUser();
      if (!currentUser) {
        router.replace('/onboarding');
      } else {
        setUser(currentUser);
      }
    }
    checkAuth();
  }, []);

  // Or just use tokens from authService:
  // const token = await authService.getToken();
}
```

## 🎯 Common Patterns

### Form with Validation
```typescript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  if (!email || !password) {
    Alert.alert('Error', 'Fill all fields');
    return;
  }

  setLoading(true);
  try {
    const { token } = await authService.login(email, password);
    router.replace('/(tabs)/home');
  } catch (error) {
    Alert.alert('Error', error.response?.data?.detail);
  } finally {
    setLoading(false);
  }
};

return (
  <>
    <InputField value={email} onChangeText={setEmail} />
    <InputField value={password} onChangeText={setPassword} secureTextEntry />
    <CustomButton title="Login" loading={loading} onPress={handleSubmit} />
  </>
);
```

### Fetch Data on Mount
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    setLoading(true);
    const response = await authAPI.getItems();
    setData(response.data.items);
  } catch (err) {
    setError('Failed to load data');
  } finally {
    setLoading(false);
  }
};

if (loading) return <ActivityIndicator />;
if (error) return <Text>{error}</Text>;
return <Text>{data?.length} items</Text>;
```

### List of Cards
```typescript
<ScrollView>
  {items.map(item => (
    <PlantCard
      key={item.id}
      plantName={item.name}
      status={item.status}
      onPress={() => Alert.alert(item.name)}
    />
  ))}
</ScrollView>
```

## 🎨 Style a Component

```typescript
import { StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
});

export default function MyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Title</Text>
    </View>
  );
}
```

## 🐛 Debug Tips

```typescript
// Console logs appear in Metro Bundler
console.log('Current user:', user);

// Check Redux state (if using)
// import { useSelector } from 'react-redux';

// View component tree
import { useDevToolsVisible } from 'expo-dev-menu';

// Check network calls
// Axios will log to console when errors occur

// Inspect styles
<View style={{borderWidth: 1, borderColor: 'red'}}> {/* Outline */}
```

## 📦 Install a New Package

```bash
# From HydroGrow folder:
npm install react-native-gesture-handler

# Or for Expo-specific:
npx expo install expo-sensors
```

## 🚨 Common Errors & Fixes

### "Metro bundler error"
```bash
npm start -- --clear
```

### "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "API connection error"
- Check backend is running on port 8000
- Check firewall
- Use `ipconfig` to get your machine IP

### "Auth token expired"
- Token auto-expires after 30 min (in FastAPI)
- Need to add refresh token logic (TODO)

## 🎯 Navigation Patterns

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// Go to screen
router.push('/onboarding');
router.push('/(tabs)/plants');
router.push('/(auth)/register');

// Replace (no back button)
router.replace('/(tabs)/home');
router.replace('/onboarding');

// Back
router.back();

// With params (advanced)
router.push(`/plant/${id}`);
```

## 📋 File Naming Convention

```
Screens:   home.tsx, login.tsx, plants.tsx
Groups:    (auth), (tabs)
Components: PlantCard.tsx, CustomButton.tsx
Services:   authService.ts, api.ts
Constants:  Colors.ts
```

## 🎭 Built-in Hooks

```typescript
// Navigation
import { useRouter } from 'expo-router';
const router = useRouter();

// Route info
import { useRoute } from '@react-navigation/native';
const route = useRoute();

// Focus effect
import { useFocusEffect } from '@react-navigation/native';
useFocusEffect(() => {
  // Runs when screen is focused
  loadData();
});
```

## 🔑 Environment Variables (Optional)

Create `.env` file:
```
API_URL=http://localhost:8000
FIREBASE_API_KEY=your_key
```

Access in code:
```typescript
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
// or
import { FIREBASE_API_KEY } from '@env';
```

## 📊 Check Your Setup

```bash
# TypeScript check
npx tsc --noEmit

# Package versions
npm list

# Start fresh
npm start -- --clear

# Test web
npm start
# Then press 'w'
```

## 🎓 Learn More

- Expo Docs: https://docs.expo.dev
- Expo Router: https://docs.expo.dev/routing/
- React Native: https://reactnative.dev
- FastAPI: https://fastapi.tiangolo.com

## 💡 Pro Tips

1. **Use Prettier**: Format on save auto-formats code
2. **TypeScript**: Catch errors before runtime
3. **React DevTools**: Check component props/state
4. **Hot Reload**: Changes auto-reload while developing
5. **AsyncStorage**: Good enough for most local data
6. **Axios Interceptors**: Auto-inject auth tokens
7. **SafeAreaView**: Always use for iOS notch safety
8. **StyleSheet**: Pre-compiles for performance

## 🚀 Deployment Checklist

Before shipping to production:
- [ ] Update API base URL to production
- [ ] Remove test credentials
- [ ] Enable HTTPS
- [ ] Set up Firebase auth
- [ ] Add error reporting (Sentry)
- [ ] Load testing
- [ ] Security audit
- [ ] Privacy policy updated

## 🆘 Need Help?

1. Check ARCHITECTURE.md for design patterns
2. Check DIAGRAMS.md for data flow
3. Look for similar patterns in existing code
4. Check error message in console
5. Check backend API docs at localhost:8000/docs

---

**Quick Command Reference:**
```
npm start              Start dev server
npm run web            Open in browser
npm run android        Android emulator
npm run ios            iOS simulator
npm test               Run tests
npm run build:web      Production build
```

Happy coding! 🌱
