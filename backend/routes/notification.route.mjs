import express from "express";
import { protectRoute } from "../middleware/protectRoute.mjs";
import { deleteNotification, deleteNotifications, getNotifications, viewNotification } from "../controllers/notification.controller.mjs";

const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.delete("/", protectRoute, deleteNotifications);
router.delete("/:id", protectRoute, deleteNotification);
router.get("/:id", protectRoute, viewNotification);

export default router;
