import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getFriends,
  searchUsers,
} from "../controllers/friendController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.use(auth); // Protect all routes

router.post("/request", sendFriendRequest);
router.post("/accept", acceptFriendRequest);
router.post("/reject", rejectFriendRequest);
router.get("/requests", getFriendRequests);
router.get("/", getFriends);
router.get("/search", searchUsers);

router.get("/search", searchUsers);

export default router;
