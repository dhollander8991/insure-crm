import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { type PolicyResponse } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('policy-alerts', {
      name: 'Policy Alerts',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return true;
}

export async function scheduleExpiryNotifications(policies: PolicyResponse[]) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = Date.now();
  const soon = policies.filter((p) => {
    if (p.status !== 'ACTIVE') return false;
    const daysLeft = Math.ceil((new Date(p.endDate).getTime() - now) / 86_400_000);
    return daysLeft > 0 && daysLeft <= 30;
  });

  for (const p of soon) {
    const daysLeft = Math.ceil((new Date(p.endDate).getTime() - now) / 86_400_000);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Policy Expiring Soon',
        body: `Policy ${p.policyNumber} for ${p.customerName} expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
        data: { policyId: p.id },
      },
      trigger: null,
    });
  }
}
