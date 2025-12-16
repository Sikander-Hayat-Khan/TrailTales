import { Router } from "express";
import { login,logout,signup,auth } from "../controllers/loginSignup.js";
import { getAllMemories, createMemory, getMemory, updateMemory, deleteMemory, getPublicMemories, getFriendsMemories } from "../controllers/memoryController.js";
import { getProfile, updateProfile, addFriend, getFriends, fixUserData } from "../controllers/userController.js";
import authorization from "../middleware/auth.js";
import multer from "multer";
import { storage } from "../config/cloudinary.js";

const upload = multer({ storage: storage });

const userRouter = Router()

// Auth Routes
userRouter.post("/login",login)
userRouter.post("/signup",signup)
userRouter.get("/logout",logout)
userRouter.get("/auth",authorization,auth)

// Memory Routes
userRouter.route("/memories")
    .get(authorization, getAllMemories)
    .post(authorization, upload.array('images', 5), createMemory);

userRouter.route("/memories/public").get(getPublicMemories); // Public route, maybe optional auth?
userRouter.route("/memories/friends").get(authorization, getFriendsMemories);

userRouter.route("/memories/:id")
    .get(authorization, getMemory)
    .patch(authorization, upload.array('images', 5), updateMemory)
    .delete(authorization, deleteMemory);

// User/Profile Routes
userRouter.route("/profile").get(authorization, getProfile).patch(authorization, updateProfile);
userRouter.route("/fix-users").get(fixUserData); // Temporary route to fix data

export default userRouter