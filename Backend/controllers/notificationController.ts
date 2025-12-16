import { Request, Response } from "express";
import Message from "../models/Message.js";
import FriendRequest from "../models/FriendRequest.js";

export const getUnreadCounts = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any).userID;

        // Count unread messages where the current user is the receiver
        const unreadMessagesCount = await Message.countDocuments({
            receiver: userId,
            read: false
        });

        // Count pending friend requests where the current user is the receiver
        const pendingRequestsCount = await FriendRequest.countDocuments({
            receiver: userId,
            status: "pending"
        });

        res.status(200).json({
            unreadMessages: unreadMessagesCount,
            pendingRequests: pendingRequestsCount
        });
    } catch (error) {
        console.error("Error fetching unread counts:", error);
        res.status(500).json({ msg: "Server error" });
    }
};
