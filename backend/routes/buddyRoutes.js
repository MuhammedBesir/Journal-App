import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  getBuddies,
  getPendingRequests,
  sendBuddyRequest,
  acceptBuddyRequest,
  declineBuddyRequest,
  removeBuddy,
} from "../controllers/buddyController.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/buddies - Get user's buddies
router.get("/", getBuddies);

// GET /api/buddies/requests - Get pending requests
router.get("/requests", getPendingRequests);

// POST /api/buddies/request - Send buddy request
router.post("/request", sendBuddyRequest);

// POST /api/buddies/accept/:requestId - Accept request
router.post("/accept/:requestId", acceptBuddyRequest);

// POST /api/buddies/decline/:requestId - Decline request
router.post("/decline/:requestId", declineBuddyRequest);

// DELETE /api/buddies/:buddyId - Remove buddy
router.delete("/:buddyId", removeBuddy);

export default router;
