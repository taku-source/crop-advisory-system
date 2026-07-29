import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { updateProfile } from './api';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions and register the device's FCM/APNs token.
 * Call this once after the user logs in.
 */
export async function registerForPushNotifications() {
  // Check existing permissions
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission not granted');
    return null;
  }

  // Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Crop Advisory',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2e7d32',
    });
  }

  // Get Expo push token (wraps FCM/APNs)
  const tokenData = await Notifications.getExpoPushTokenAsync();
  const fcmToken  = tokenData.data;

  // Save to backend so admin can send targeted pushes
  try {
    await updateProfile({ fcmToken });
    console.log('FCM token registered:', fcmToken);
  } catch (err) {
    console.warn('Could not save FCM token to server:', err.message);
  }

  return fcmToken;
}

/**
 * Set up foreground and tap listeners.
 * Returns a cleanup function — call it in useEffect cleanup.
 */
export function setupNotificationListeners(onNotification, onNotificationTap) {
  const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
    onNotification?.(notification);
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    onNotificationTap?.(response.notification);
  });

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}
