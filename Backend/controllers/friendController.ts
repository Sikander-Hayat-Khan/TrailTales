import { Request, Response } from "express";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import Message from "../models/Message.js";

// Send a friend request
export const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const { receiverId } = req.body;
    const senderId = (req.user as any).userID;

    if (senderId === receiverId) {
      return res.status(400).json({ msg: "You cannot send a friend request to yourself" });
    }

    const existingRequest = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ msg: "Friend request already sent" });
    }

    const alreadyFriends = await User.findOne({
      _id: senderId,
      friends: receiverId,
    });

    if (alreadyFriends) {
      return res.status(400).json({ msg: "You are already friends" });
    }

    const newRequest = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
    });

    res.status(201).json({ msg: "Friend request sent", request: newRequest });
  } catch (error) {
    res.status(500).json({ msg: (error as any).message });
  }
};

// Accept a friend request
export const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.body;
    const userId = (req.user as any).userID;

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ msg: "Friend request not found" });
    }

    if (request.receiver.toString() !== userId) {
      return res.status(403).json({ msg: "Not authorized to accept this request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ msg: "Request already handled" });
    }

    request.status = "accepted";
    await request.save();

    // Concurrency: Update both users' friend lists in parallel
    await Promise.all([
        User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } }),
        User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } })
    ]);

    res.status(200).json({ msg: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ msg: (error as any).message });
  }
};

// Reject a friend request
export const rejectFriendRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.body;
    const userId = (req.user as any).userID;

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ msg: "Friend request not found" });
    }

    if (request.receiver.toString() !== userId) {
      return res.status(403).json({ msg: "Not authorized to reject this request" });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({ msg: "Friend request rejected" });
  } catch (error) {
    res.status(500).json({ msg: (error as any).message });
  }
};

// Get pending friend requests
export const getFriendRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).userID;
    const requests = await FriendRequest.find({ receiver: userId, status: "pending" })
      .populate("sender", "username email avatarColor");
    
    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ msg: (error as any).message });
  }
};

// Get friends list
export const getFriends = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).userID;
    const user = await User.findById(userId).populate("friends", "username email avatarColor bio");
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const friendsWithCounts = await Promise.all(user.friends.map(async (friend) => {
      const unreadCount = await Message.countDocuments({
        sender: friend._id,
        receiver: userId,
        read: false
      });
      return {
        ...(friend as any).toObject(),
        unreadCount
      };
    }));
    
    res.status(200).json({ friends: friendsWithCounts });
  } catch (error) {
    res.status(500).json({ msg: (error as any).message });
  }
};

// Search users
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(200).json({ users: [] });

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
      _id: { $ne: (req.user as any).userID } // Exclude self
    } as any).select("username email avatarColor bio");

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ msg: (error as any).message });
  }
};
