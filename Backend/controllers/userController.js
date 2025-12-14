import User from "../models/User.js";
import Memory from "../models/Memory.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userID).select("-password").populate("friends", "username avatarColor bio");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Calculate stats
    const pinsCount = await Memory.countDocuments({ userId: req.user.userID });
    const countries = await Memory.distinct("country", { userId: req.user.userID, country: { $ne: null } });
    const countriesCount = countries.length;

    // Return user object with stats appended (or separate)
    // We can append it to the user object if we convert it to object first
    const userWithStats = {
      ...user.toObject(),
      pinsCount,
      countriesCount
    };

    res.status(200).json({ user: userWithStats });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { bio, avatarColor } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userID,
      { bio, avatarColor },
      { new: true, runValidators: true }
    ).select("-password");
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const addFriend = async (req, res) => {
  try {
    const { friendUsername } = req.body;
    if (!friendUsername) return res.status(400).json({ msg: "Please provide a username" });

    const friend = await User.findOne({ username: friendUsername });
    if (!friend) return res.status(404).json({ msg: "User not found" });

    if (friend._id.toString() === req.user.userID) {
      return res.status(400).json({ msg: "You cannot add yourself" });
    }

    const user = await User.findById(req.user.userID);
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ msg: "User is already your friend" });
    }

    user.friends.push(friend._id);
    await user.save();

    // Optional: Add current user to friend's friend list (mutual friendship)
    // friend.friends.push(user._id);
    // await friend.save();

    res.status(200).json({ msg: "Friend added successfully", friend: { username: friend.username, avatarColor: friend.avatarColor, bio: friend.bio } });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.userID).populate("friends", "username avatarColor bio");
    res.status(200).json({ friends: user.friends });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const fixUserData = async (req, res) => {
  try {
    const users = await User.find({});
    let fixedCount = 0;

    for (const user of users) {
      // Check if username looks like an email and email field is missing or empty
      const isEmailUsername = user.username.includes("@");
      const hasNoEmail = !user.email || user.email === "";

      if (isEmailUsername && hasNoEmail) {
        // Move username to email
        user.email = user.username;
        // Set username to the part before @
        user.username = user.username.split("@")[0];
        await user.save();
        fixedCount++;
      }
    }

    res.status(200).json({ msg: `Fixed ${fixedCount} users.` });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
