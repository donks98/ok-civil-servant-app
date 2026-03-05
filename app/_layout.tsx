import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppStore } from '../store/useAppStore';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const segments = useSegments();

  useEffect(() => {
    const inAuth = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)');
    } else if (isAuthenticated && inAuth) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  return <>{children}</>;
}

function DarkModeScheduler() {
  const colorScheme = useAppStore((s) => s.colorScheme);
  const darkModeSchedule = useAppStore((s) => s.darkModeSchedule);
  const setColorScheme = useAppStore((s) => s.setColorScheme);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (colorScheme !== 'auto' || !darkModeSchedule.enabled) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const check = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const current = h * 60 + m;

      const [sh, sm] = darkModeSchedule.startTime.split(':').map(Number);
      const [eh, em] = darkModeSchedule.endTime.split(':').map(Number);
      const start = sh * 60 + sm;
      const end = eh * 60 + em;

      let isDarkTime: boolean;
      if (start > end) {
        // Spans midnight: e.g. 22:00 – 06:00
        isDarkTime = current >= start || current < end;
      } else {
        isDarkTime = current >= start && current < end;
      }

      setColorScheme(isDarkTime ? 'dark' : 'light');
    };

    check();
    intervalRef.current = setInterval(check, 60000);
    const sub = AppState.addEventListener('change', (state) => { if (state === 'active') check(); });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      sub.remove();
    };
  }, [colorScheme, darkModeSchedule]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthGuard>
        <DarkModeScheduler />
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthGuard>
    </GestureHandlerRootView>
  );
}
