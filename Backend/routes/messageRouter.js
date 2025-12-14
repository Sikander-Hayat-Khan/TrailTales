import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/messageController.js";
import authorization from "../middleware/auth.js";

const messageRouter = Router();

messageRouter.post("/", authorization, sendMessage);
messageRouter.get("/:friendId", authorization, getMessages);

export default messageRouter;
