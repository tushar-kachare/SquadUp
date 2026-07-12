import { useCallback, useEffect, useState } from "react";
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "../api/push.api";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

function supportsPushNotifications(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export function usePushSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supportsPushNotifications()) {
      return;
    }

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setIsSubscribed(subscription !== null))
      .catch((error: unknown) => {
        console.error("Unable to check push subscription:", error);
      });
  }, []);

  const subscribe = useCallback(async () => {
    if (!supportsPushNotifications()) {
      throw new Error("Push notifications are not supported by this browser");
    }

    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      throw new Error("VITE_VAPID_PUBLIC_KEY is not configured");
    }

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      const subscriptionJson = subscription.toJSON();
      const p256dh = subscriptionJson.keys?.p256dh;
      const auth = subscriptionJson.keys?.auth;

      if (!subscriptionJson.endpoint || !p256dh || !auth) {
        throw new Error("The browser returned an incomplete push subscription");
      }

      await subscribeToPushNotifications({
        endpoint: subscriptionJson.endpoint,
        keys: { p256dh, auth },
      });
      setIsSubscribed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (!supportsPushNotifications()) {
      throw new Error("Push notifications are not supported by this browser");
    }

    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        setIsSubscribed(false);
        return;
      }

      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await unsubscribeFromPushNotifications(endpoint);
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  return { subscribe, unsubscribe, isSubscribed, loading };
}
