import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as pushController from "./push.controller.js";

const router = Router();

router.post("/subscribe", requireAuth, pushController.subscribe);
router.post("/unsubscribe", requireAuth, pushController.unsubscribe);
router.post("/test-send", requireAuth, pushController.sendTestPush);

export default router;
