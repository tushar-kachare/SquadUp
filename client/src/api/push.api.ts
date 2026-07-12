import { apiRequest } from "./client";

type PushSubscriptionPayload = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export function subscribeToPushNotifications(subscription: PushSubscriptionPayload) {
  return apiRequest<{ subscribed: boolean }>("/push/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
  });
}

export function unsubscribeFromPushNotifications(endpoint: string) {
  return apiRequest<{ unsubscribed: boolean }>("/push/unsubscribe", {
    method: "POST",
    body: JSON.stringify({ endpoint }),
  });
}
