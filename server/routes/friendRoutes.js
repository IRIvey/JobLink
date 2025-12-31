import express from 'express';
import {
  getFriends,
  getFriendRequests,
  getSuggestions,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  cancelFriendRequest,
  getMutualFriends,
  searchUsers
} from '../controllers/friendController.js';
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all friends
router.get('/friends', getFriends);

// Get friend requests (received)
router.get('/requests', getFriendRequests);

// Get friend suggestions
router.get('/suggestions', getSuggestions);

// Search for users
router.get('/search', searchUsers);

// Get mutual friends with a specific user
router.get('/mutual/:friendId', getMutualFriends);

// Send friend request
router.post('/request', sendFriendRequest);

// Accept friend request
router.put('/request/:requestId/accept', acceptFriendRequest);

// Reject friend request
router.delete('/request/:requestId/reject', rejectFriendRequest);

// Cancel sent friend request
router.delete('/request/cancel/:recipientId', cancelFriendRequest);

// Remove friend
router.delete('/friend/:friendId', removeFriend);

export default router;