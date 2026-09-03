import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'desihub-theme';

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((t) => {
        if (t === 'dark' || t === 'light') setColorScheme(t);
      })
      .catch(() => {});
  }, [setColorScheme]);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="e/[slug]" options={{ presentation: 'card' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
