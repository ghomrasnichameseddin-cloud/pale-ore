import { soundSystem } from './soundEffects';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export interface NativeNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  vibrate?: number[];
  soundCategory?: 'achievement' | 'alert' | 'warning' | 'log' | 'note' | 'delayed' | string;
  onClick?: () => void;
  silent?: boolean;
}

// Check if running in browser with Notification API
export const isNotificationSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window;
};

// Check if running in an iframe (e.g. AI Studio preview)
export const isInIframe = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

// Detect mobile device
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
};

// Get current permission status
export const getNotificationPermission = (): NotificationPermissionState => {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    return Notification.permission as NotificationPermissionState;
  } catch (e) {
    return 'unsupported';
  }
};

// Request permission with support for Promise and legacy callback
export const requestNotificationPermission = async (): Promise<NotificationPermissionState> => {
  if (!isNotificationSupported()) return 'unsupported';

  try {
    let result: NotificationPermission;
    
    // Modern Promise-based check
    const permissionPromise = Notification.requestPermission();
    if (permissionPromise && typeof permissionPromise.then === 'function') {
      result = await permissionPromise;
    } else {
      // Legacy callback for older Safari/browsers
      result = await new Promise<NotificationPermission>((resolve) => {
        Notification.requestPermission((res) => resolve(res));
      });
    }

    return result as NotificationPermissionState;
  } catch (err) {
    console.warn('Notification permission request error:', err);
    // In restricted iframes, Notification.requestPermission() may throw
    return getNotificationPermission();
  }
};

// Trigger mobile haptic vibration
export const triggerVibration = (pattern: number[] = [150, 75, 150]): boolean => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
      return true;
    } catch (e) {
      // Ignore vibration restrictions
    }
  }
  return false;
};

// Standard SVG Icon encoded as data URI for notifications
export const DEFAULT_NOTIFICATION_ICON = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="20" fill="#07080c" />
  <rect x="5" y="5" width="90" height="90" rx="16" fill="none" stroke="#c5a059" stroke-width="3" opacity="0.6"/>
  <polygon points="50,15 85,50 50,85 15,50" fill="#141824" stroke="#c5a059" stroke-width="3" />
  <rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)" fill="#3a2e12" stroke="#fef08a" stroke-width="2" />
  <circle cx="50" cy="50" r="12" fill="#c5a059" />
  <circle cx="50" cy="50" r="6" fill="#fef08a" />
</svg>
`);

// Send native notification to PC / Mac / Linux / Android / Mobile OS notification tray
export const sendNativeNotification = async (options: NativeNotificationOptions): Promise<boolean> => {
  const {
    title,
    body,
    icon = DEFAULT_NOTIFICATION_ICON,
    badge = DEFAULT_NOTIFICATION_ICON,
    tag = `pale-ore-${Date.now()}`,
    data = {},
    vibrate = [150, 80, 150],
    soundCategory = 'alert',
    onClick,
    silent = false
  } = options;

  // 1. Mobile haptic feedback & Audio Chime
  if (!silent) {
    triggerVibration(vibrate);
    if (soundCategory) {
      soundSystem.playNotification(soundCategory);
    }
  }

  // 2. Check if browser notifications are supported and granted
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    // 3. Prefer Service Worker registration (critical for Android Chrome, PWAs, background delivery)
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && typeof registration.showNotification === 'function') {
          await (registration as any).showNotification(title, {
            body,
            icon,
            badge,
            tag,
            vibrate,
            renotify: true,
            data: {
              url: window.location.href,
              ...data
            }
          });
          return true;
        }
      } catch (swErr) {
        // Service worker showNotification might fail or not be active in preview; fallback to Window Notification
      }
    }

    // 4. Fallback to Window Notification API (works on Desktop Windows/Mac/Linux/Chrome/Edge/Firefox)
    const notification = new Notification(title, {
      body,
      icon,
      badge,
      tag,
      data
    } as any);

    notification.onclick = (event) => {
      event.preventDefault();
      try {
        window.focus();
      } catch (e) {}
      notification.close();
      if (onClick) {
        onClick();
      }
    };

    return true;
  } catch (err) {
    console.warn('Native notification dispatch error:', err);
    return false;
  }
};

// Quick helper to test notifications
export const testNativeNotification = async (onOpenInbox?: () => void): Promise<{ success: boolean; message: string }> => {
  if (!isNotificationSupported()) {
    return {
      success: false,
      message: 'Web Notifications API is not supported in this browser environment.'
    };
  }

  let permission = getNotificationPermission();
  if (permission !== 'granted') {
    permission = await requestNotificationPermission();
  }

  if (permission !== 'granted') {
    return {
      success: false,
      message: permission === 'denied' 
        ? 'Notification permission was denied. Please allow notifications in your browser site settings.'
        : 'Notification permission is required to deliver PC & Mobile alerts.'
    };
  }

  const dispatched = await sendNativeNotification({
    title: '⚔️ Pale Ore Sanctum Communiqué',
    body: 'PC & Mobile notifications successfully linked! You will receive live alerts for delayed quests, directives & achievements.',
    soundCategory: 'achievement',
    vibrate: [200, 100, 200],
    onClick: onOpenInbox
  });

  return {
    success: dispatched,
    message: dispatched 
      ? 'Test notification dispatched to your operating system!'
      : 'Failed to display notification. Ensure browser OS notification permissions are allowed.'
  };
};
