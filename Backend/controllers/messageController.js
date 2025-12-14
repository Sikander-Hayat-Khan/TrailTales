import Message from "../models/Message.js";
import User from "../models/User.js";

export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.userID;

        if (!receiverId || !content) {
            return res.status(400).json({ msg: "Receiver and content are required" });
        }

        // Verify receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ msg: "Receiver not found" });
        }

        const newMessage = await Message.create({
            sender: senderId,
            receiver: receiverId,
            content
        });

        // Populate sender and receiver details for immediate frontend display if needed
        await newMessage.populate("sender", "username avatarColor");
        await newMessage.populate("receiver", "username avatarColor");

        res.status(201).json({ msg: "Message sent", message: newMessage });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ msg: "Server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { friendId } = req.params;
        const userId = req.user.userID;

        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: friendId },
                { sender: friendId, receiver: userId }
            ]
        })
        .sort({ createdAt: 1 }) // Oldest first
        .populate("sender", "username avatarColor")
        .populate("receiver", "username avatarColor");

        res.status(200).json({ messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ msg: "Server error" });
    }
};
