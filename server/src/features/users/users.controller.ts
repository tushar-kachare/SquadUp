import type { Request, Response } from "express";
import * as usersService from "./users.service.js";
import { sendSuccess, sendError } from "../../utils/apiResponse.js";
type IdParams = {
  id: string;
};
export async function createUser(req: Request, res: Response) {
  try {
    const { firebaseUid, displayName, email } = req.body;

    if (!firebaseUid || !displayName) {
      return sendError(res, "firebaseUid and displayName are required", 400);
    }

    const user = await usersService.createUser({
      firebaseUid,
      displayName,
      email,
    });
    sendSuccess(res, user, undefined, 201);
  } catch (err: any) {
    if (err.code === "23505") {
      return sendError(
        res,
        "A user with this firebaseUid already exists",
        409,
        "USER_EXISTS",
      );
    }
    console.error("Error creating user:", err);
    sendError(res, "Failed to create user");
  }
}

export async function getUserById(req: Request<IdParams>, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      sendError(res, "User ID is required", 400);
      return;
    }
    const user = await usersService.getUserById(id);

    if (!user) {
      return sendError(res, "User not found", 404, "USER_NOT_FOUND");
    }

    sendSuccess(res, user);
  } catch (err) {
    console.error("Error fetching user:", err);
    sendError(res, "Failed to fetch user");
  }
}
