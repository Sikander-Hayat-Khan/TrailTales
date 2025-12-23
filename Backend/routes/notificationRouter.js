import { Router } from "express";
import { getUnreadCounts } from "../controllers/notificationController.js";
import authorization from "../middleware/auth.js";

const notificationRouter = Router();

notificationRouter.get("/unread-counts", authorization, getUnreadCounts);

export default notificationRouter;
