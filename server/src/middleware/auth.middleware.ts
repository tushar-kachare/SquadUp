import type { NextFunction, Request, Response } from "express";
import { firebaseAuth } from "../config/firebaseAdmin.js";
import { sendError } from "../utils/apiResponse.js";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.header("authorization");

  if (!authHeader) {
    sendError(res, "Authorization header is required", 401, "UNAUTHORIZED");
    return;
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token || authHeader.split(" ").length !== 2) {
    sendError(res, "Authorization header must be in the format Bearer <token>", 401, "UNAUTHORIZED");
    return;
  }

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    req.user = { uid: decodedToken.uid };
    next();
  } catch {
    sendError(res, "Invalid or expired token", 401, "INVALID_TOKEN");
  }
}

