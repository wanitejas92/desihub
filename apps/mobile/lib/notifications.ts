import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ASKED_KEY = 'desihub-push-asked';

/**
 * Requests push permission — but only the first time the user saves an event,
 * never on launch (per the brief). Returns whether permission is granted.
 */
export async function maybeAskForPushPermission(): Promise<boolean> {
  try {
    const asked = await AsyncStorage.getItem(ASKED_KEY);
    if (asked) {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    }
    await AsyncStorage.setItem(ASKED_KEY, '1');
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}
