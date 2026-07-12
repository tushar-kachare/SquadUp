import type { Request, Response } from "express";
import { getUserIdByFirebaseUid } from "../users/users.service.js";
import { sendError, sendSuccess } from "../../utils/apiResponse.js";
import webpush from "../../config/webPush.js";
import * as pushService from "./push.service.js";

type SubscribeBody = {
  endpoint?: unknown;
  keys?: {
    p256dh?: unknown;
    auth?: unknown;
  };
};

type UnsubscribeBody = {
  endpoint?: unknown;
};

export async function subscribe(req: Request, res: Response) {
  console.log("Received push subscription request:", req.body);
  try {
    if (!req.user) {
      return sendError(res, "Authentication is required", 401, "UNAUTHORIZED");
    }

    const { endpoint, keys } = req.body as SubscribeBody;
    if (
      typeof endpoint !== "string" ||
      typeof keys?.p256dh !== "string" ||
      typeof keys.auth !== "string"
    ) {
      return sendError(res, "A valid push subscription is required", 400, "INVALID_SUBSCRIPTION");
    }

    const userId = await getUserIdByFirebaseUid(req.user.uid);
    await pushService.savePushSubscription(userId, {
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });

    return sendSuccess(res, { subscribed: true }, undefined, 201);
  } catch (err) {
    console.error("Error saving push subscription:", err);
    return sendError(res, "Failed to save push subscription");
  }
}

export async function unsubscribe(req: Request, res: Response) {
  console.log("Received push unsubscription request:", req.body);
  try {
    if (!req.user) {
      return sendError(res, "Authentication is required", 401, "UNAUTHORIZED");
    }

    const { endpoint } = req.body as UnsubscribeBody;
    if (typeof endpoint !== "string") {
      return sendError(res, "A valid subscription endpoint is required", 400, "INVALID_SUBSCRIPTION");
    }

    const userId = await getUserIdByFirebaseUid(req.user.uid);
    await pushService.removePushSubscription(userId, endpoint);

    return sendSuccess(res, { unsubscribed: true });
  } catch (err) {
    console.error("Error removing push subscription:", err);
    return sendError(res, "Failed to remove push subscription");
  }
}

export async function sendTestPush(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, "Authentication is required", 401, "UNAUTHORIZED");
    }

    const userId = await getUserIdByFirebaseUid(req.user.uid);
    const subscriptions = await pushService.getPushSubscriptionsByUserId(userId);

    if (subscriptions.length === 0) {
      return sendError(res, "No push subscriptions found for this user", 404, "SUBSCRIPTION_NOT_FOUND");
    }

    const results = await Promise.allSettled(
      subscriptions.map((subscription) =>
        webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify({
            title: "Test push",
            body: "This is a test notification from SquadUp",
          }),
        ),
      ),
    );
    const sent = results.filter((result) => result.status === "fulfilled").length;
    const failed = results.length - sent;

    if (sent === 0) {
      console.error("Failed to send test push notification:", results);
      return sendError(res, "Failed to send test push notification", 502, "PUSH_SEND_FAILED");
    }

    if (failed > 0) {
      console.error("Some test push notifications failed:", results);
    }

    return sendSuccess(res, { sent, failed });
  } catch (err) {
    console.error("Error sending test push notification:", err);
    return sendError(res, "Failed to send test push notification");
  }
}
