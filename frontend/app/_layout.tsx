import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import authService from '../services/authService';
import Colors from '../constants/Colors';

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize auth service (restore token if it exists)
      await authService.initialize();
      // Check if user is logged in
      const loggedIn = await authService.isLoggedIn();
      setIsLoggedIn(loggedIn);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsLoggedIn(false);
    }
  };

  if (isLoggedIn === null) {
    // Loading state
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {isLoggedIn ? (
        // App Stack (logged in)
        <Stack.Screen name="(tabs)" />
      ) : (
        // Auth Stack (not logged in)
        <>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(auth)" />
        </>
      )}
    </Stack>
  );
}
