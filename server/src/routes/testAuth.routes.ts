import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { sendSuccess } from "../utils/apiResponse.js";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  sendSuccess(res, { uid: req.user!.uid});
});

export default router;

