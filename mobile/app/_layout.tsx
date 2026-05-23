import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { policyApi, tokenStorage } from '../src/lib/api';
import { requestNotificationPermission, scheduleExpiryNotifications } from '../src/lib/notifications';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

async function checkAndNotify() {
  const token = await tokenStorage.get();
  if (!token) return;
  try {
    const policies = await policyApi.getAll();
    await scheduleExpiryNotifications(policies);
  } catch {
    // silent — don't block app startup
  }
}

export default function RootLayout() {
  useEffect(() => {
    requestNotificationPermission().then((granted) => {
      if (granted) checkAndNotify();
    });

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        requestNotificationPermission().then((granted) => {
          if (granted) checkAndNotify();
        });
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
