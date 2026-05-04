import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import authService from '../services/authService';

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();

  useEffect(() => {
    refreshAuthState();
  }, []);

  const refreshAuthState = async () => {
    try {
      await authService.initialize();
      const loggedIn = await authService.isLoggedIn();
      setIsLoggedIn(loggedIn);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    refreshAuthState();
  }, [pathname]);

  useEffect(() => {
    if (isLoggedIn === null) {
      return;
    }

    const inAuthFlow = segments[0] === '(auth)' || pathname === '/onboarding';

    if (isLoggedIn && inAuthFlow) {
      router.replace('/(tabs)/home');
    } else if (!isLoggedIn && !inAuthFlow) {
      router.replace('/(auth)/login');
    }
  }, [isLoggedIn, pathname, router, segments]);

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
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
