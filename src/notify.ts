import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ActiveSession } from './types';

const CHANNEL = 'focus-sessions';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // When the app is open it celebrates on screen already, so no banner on top
    shouldShowBanner: AppState.currentState !== 'active',
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let channelReady = false;

const ensureChannel = async () => {
  if (Platform.OS !== 'android' || channelReady) return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: 'Focus sessions',
    // eslint-disable-next-line import/namespace -- re-exported enum the import resolver cannot follow
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 400, 200, 400],
    lightColor: '#4F9D69',
  });
  channelReady = true;
};

const allowed = (p: Notifications.NotificationPermissionsStatus) =>
  p.granted ||
  // eslint-disable-next-line import/namespace -- re-exported enum the import resolver cannot follow
  p.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

/** Asks the user once, at the moment they plant their first tree. */
export const askNotificationPermission = async () => {
  try {
    // Android 13+ shows no prompt until a channel exists
    await ensureChannel();
    const current = await Notifications.getPermissionsAsync();
    if (allowed(current)) return true;
    if (!current.canAskAgain) return false;
    const asked = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    });
    return allowed(asked);
  } catch {
    return false;
  }
};

// There is only ever one reminder. Calls run one after another so that two
// overlapping syncs cannot cancel each other's freshly scheduled notification.
let queue: Promise<void> = Promise.resolve();

/**
 * Keeps the "session finished" notification in step with the active session.
 * Re-scheduling on every app start also restores the reminder after a reboot,
 * which clears the system's alarm list.
 */
export const syncSessionReminder = (active: ActiveSession | null) => {
  queue = queue.then(async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (!active || active.endAt <= Date.now() + 1000) return;

      const permission = await Notifications.getPermissionsAsync();
      if (!allowed(permission)) return;

      await ensureChannel();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Your tree is fully grown',
          body: `"${active.goal}" is done. Open Focus Lock to collect it.`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(active.endAt),
          channelId: CHANNEL,
        },
      });
    } catch {
      // A reminder is a bonus. It must never break a focus session.
    }
  });
  return queue;
};
