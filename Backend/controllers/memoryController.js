import Memory from "../models/Memory.js";
import User from "../models/User.js";
import { parseSearchQuery } from "../utils/searchParser.js";
import { MEMORY_CONFIG } from "../config/constants.js";

export const searchMemories = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ msg: "Query parameter 'q' is required" });
        }

        // Use the Little Language Parser
        const ast = parseSearchQuery(q);
        
        const query = { userId: req.user.userID }; // Default to searching own memories
        const orConditions = [];

        ast.forEach(node => {
            if (node.type === 'FILTER') {
                if (node.field === 'tag') {
                    query.tags = node.value;
                } else if (node.field === 'date') {
                    // Simple date match (starts with)
                    // In a real app, this would be more complex range query
                    // Assuming date is stored as ISO string or similar
                } else if (node.field === 'visibility') {
                    if (MEMORY_CONFIG.VISIBILITY_OPTIONS.includes(node.value)) {
                        query.visibility = node.value;
                    }
                }
            } else if (node.type === 'TEXT') {
                // Search in title or description
                orConditions.push({ title: { $regex: node.text, $options: 'i' } });
                orConditions.push({ description: { $regex: node.text, $options: 'i' } });
            }
        });

        if (orConditions.length > 0) {
            query.$or = orConditions;
        }

        const memories = await Memory.find(query);
        res.status(200).json({ memories });

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const getAllMemories = async (req, res) => {
  try {
    const memories = await Memory.find({ userId: req.user.userID }).sort("-createdAt");
    res.status(200).json({ memories });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getPublicMemories = async (req, res) => {
  try {
    const memories = await Memory.find({ visibility: "public" })
      .populate("userId", "username avatarColor")
      .sort("-createdAt");
    res.status(200).json({ memories });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getFriendsMemories = async (req, res) => {
  try {
    const user = await User.findById(req.user.userID);
    const friendsIds = user.friends;

    const memories = await Memory.find({
      userId: { $in: friendsIds },
      visibility: { $in: ["friends", "public"] }
    })
    .populate("userId", "username avatarColor")
    .sort("-createdAt");

    res.status(200).json({ memories });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createMemory = async (req, res) => {
  try {
    console.log("Create Memory Body:", req.body);
    req.body.userId = req.user.userID;
    
    // Handle file uploads
    if (req.files && req.files.length > 0) {
        const imageUrls = req.files.map(file => file.path);
        req.body.images = imageUrls;
    }

    // Parse location from FormData (which flattens objects)
    if (req.body.location) {
        if (typeof req.body.location === 'string') {
            try {
                req.body.location = JSON.parse(req.body.location);
            } catch (e) {
                console.error("Failed to parse location JSON", e);
                return res.status(400).json({ msg: "Invalid location format" });
            }
        }
    } else if (req.body['location[lat]']) {
        req.body.location = {
            lat: parseFloat(req.body['location[lat]']),
            lng: parseFloat(req.body['location[lng]']),
            name: req.body['location[name]']
        };
    }

    // Parse tags
    if (req.body.tags) {
        req.body.tags = Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags];
    } else if (req.body['tags[]']) {
        req.body.tags = Array.isArray(req.body['tags[]']) ? req.body['tags[]'] : [req.body['tags[]']];
    } else {
        req.body.tags = [];
    }

    // Mutability Check: Ensure we don't exceed max tags defined in immutable config
    if (req.body.tags.length > MEMORY_CONFIG.MAX_TAGS) {
        return res.status(400).json({ msg: `Too many tags. Max allowed is ${MEMORY_CONFIG.MAX_TAGS}` });
    }

    const memory = await Memory.create(req.body);
    res.status(201).json({ memory });
  } catch (error) {
    console.error("Create Memory Error:", error);
    res.status(500).json({ msg: error.message });
  }
};

export const getMemory = async (req, res) => {
  try {
    const { id: memoryID } = req.params;
    const memory = await Memory.findOne({ _id: memoryID, userId: req.user.userID });
    if (!memory) {
      return res.status(404).json({ msg: `No memory with id: ${memoryID}` });
    }
    res.status(200).json({ memory });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updateMemory = async (req, res) => {
  try {
    const { id: memoryID } = req.params;
    
    // Handle file uploads
    if (req.files && req.files.length > 0) {
        const newImageUrls = req.files.map(file => file.path);
        // If there are existing images passed as strings (from frontend state), keep them
        let existingImages = [];
        if (req.body.existingImages) {
             existingImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
        }
        req.body.images = [...existingImages, ...newImageUrls];
    } else {
        if (req.body.existingImages) {
             req.body.images = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
        }
    }

    // Parse location from FormData
    if (req.body.location && typeof req.body.location === 'string') {
        try {
            req.body.location = JSON.parse(req.body.location);
        } catch (e) {
            console.error("Failed to parse location JSON", e);
        }
    } else if (req.body['location[lat]']) {
        req.body.location = {
            lat: parseFloat(req.body['location[lat]']),
            lng: parseFloat(req.body['location[lng]']),
            name: req.body['location[name]']
        };
    }

    // Parse tags
    if (req.body.tags) {
        req.body.tags = Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags];
    } else if (req.body['tags[]']) {
        req.body.tags = Array.isArray(req.body['tags[]']) ? req.body['tags[]'] : [req.body['tags[]']];
    } else {
        // If no tags are provided in the update, assume the user removed them (since frontend sends full state)
        req.body.tags = [];
    }

    const memory = await Memory.findOneAndUpdate(
      { _id: memoryID, userId: req.user.userID },
      req.body,
      { new: true, runValidators: true }
    );
    if (!memory) {
      return res.status(404).json({ msg: `No memory with id: ${memoryID}` });
    }
    res.status(200).json({ memory });
  } catch (error) {
    console.error("Update Memory Error:", error);
    res.status(500).json({ msg: error.message });
  }
};

export const deleteMemory = async (req, res) => {
  try {
    const { id: memoryID } = req.params;
    const memory = await Memory.findOneAndDelete({ _id: memoryID, userId: req.user.userID });
    if (!memory) {
      return res.status(404).json({ msg: `No memory with id: ${memoryID}` });
    }
    res.status(200).json({ msg: "Memory deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
