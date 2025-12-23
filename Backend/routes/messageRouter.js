import { Router } from "express";
import { sendMessage, getMessages, markMessagesRead } from "../controllers/messageController.js";
import authorization from "../middleware/auth.js";

const messageRouter = Router();

messageRouter.post("/", authorization, sendMessage);
messageRouter.get("/:friendId", authorization, getMessages);
messageRouter.post("/read", authorization, markMessagesRead);

export default messageRouter;
