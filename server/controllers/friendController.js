import Friend from '../models/Friend.js';
import JobSeeker from '../models/JobSeeker.js';
import mongoose from 'mongoose';

// Get all friends for the logged-in user
export const getFriends = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all accepted friendships where user is either requester or recipient
    const friendships = await Friend.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    }).populate('requester recipient', 'fullName email location bio skills experience');

    // Extract friend data
    const friends = friendships.map(friendship => {
      const friend = friendship.requester.equals(userId) 
        ? friendship.recipient 
        : friendship.requester;

      return {
        id: friend._id,
        name: friend.fullName || 'Anonymous User',
        email: friend.email,
        location: friend.location || 'Location not specified',
        role: friend.experience?.[0]?.title || 'Job Seeker',
        company: friend.experience?.[0]?.company || 'Not specified',
        bio: friend.bio,
        skills: friend.skills || [],
        mutualFriends: 0, // Will be calculated separately
        avatar: null
      };
    });

    // Calculate mutual friends for each friend
    for (let friend of friends) {
      const mutualCount = await getMutualFriendsCount(userId, friend.id);
      friend.mutualFriends = mutualCount;
    }

    res.json({
      success: true,
      friends
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching friends',
      error: error.message
    });
  }
};

// Get pending friend requests (received)
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find pending requests where current user is the recipient
    const requests = await Friend.find({
      recipient: userId,
      status: 'pending'
    }).populate('requester', 'fullName email location bio skills experience');

    const friendRequests = await Promise.all(requests.map(async request => {
      const mutualCount = await getMutualFriendsCount(userId, request.requester._id);
      
      return {
        id: request._id,
        userId: request.requester._id,
        name: request.requester.fullName || 'Anonymous User',
        email: request.requester.email,
        location: request.requester.location || 'Location not specified',
        role: request.requester.experience?.[0]?.title || 'Job Seeker',
        company: request.requester.experience?.[0]?.company || 'Not specified',
        bio: request.requester.bio,
        skills: request.requester.skills || [],
        mutualFriends: mutualCount,
        avatar: null,
        requestedAt: request.createdAt
      };
    }));

    res.json({
      success: true,
      requests: friendRequests
    });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching friend requests',
      error: error.message
    });
  }
};

// Get friend suggestions
export const getSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentUser = await JobSeeker.findById(userId);

    // Get user's existing friends and pending requests
    const existingConnections = await Friend.find({
      $or: [
        { requester: userId },
        { recipient: userId }
      ]
    });

    const connectedUserIds = existingConnections.map(conn => {
      return conn.requester.equals(userId) ? conn.recipient : conn.requester;
    });

    // Add current user to exclusion list
    const excludeIds = [...connectedUserIds, userId];

    // Find potential friends based on:
    // 1. Similar skills
    // 2. Same location
    // 3. Friends of friends
    const suggestions = await JobSeeker.find({
      _id: { $nin: excludeIds },
      $or: [
        { skills: { $in: currentUser.skills || [] } },
        { location: currentUser.location }
      ]
    }).limit(10);

    const suggestionList = await Promise.all(suggestions.map(async user => {
      const mutualCount = await getMutualFriendsCount(userId, user._id);
      
      return {
        id: user._id,
        name: user.fullName || 'Anonymous User',
        email: user.email,
        location: user.location || 'Location not specified',
        role: user.experience?.[0]?.title || 'Job Seeker',
        company: user.experience?.[0]?.company || 'Not specified',
        bio: user.bio,
        skills: user.skills || [],
        mutualFriends: mutualCount,
        avatar: null
      };
    }));

    // Sort by mutual friends count (descending)
    suggestionList.sort((a, b) => b.mutualFriends - a.mutualFriends);

    res.json({
      success: true,
      suggestions: suggestionList
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching suggestions',
      error: error.message
    });
  }
};

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipientId } = req.body;

    // Validate recipient exists
    const recipient = await JobSeeker.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is trying to add themselves
    if (userId.equals(recipientId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send friend request to yourself'
      });
    }

    // Check if friendship already exists
    const existingFriendship = await Friend.getFriendship(userId, recipientId);
    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'You are already friends'
        });
      } else if (existingFriendship.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Friend request already sent'
        });
      } else if (existingFriendship.status === 'blocked') {
        return res.status(400).json({
          success: false,
          message: 'Cannot send friend request'
        });
      }
    }

    // Create new friend request
    const friendRequest = new Friend({
      requester: userId,
      recipient: recipientId,
      status: 'pending'
    });

    await friendRequest.save();

    res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
      request: friendRequest
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Friend request already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error sending friend request',
      error: error.message
    });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    // Find the friend request
    const friendRequest = await Friend.findById(requestId);
    
    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    // Verify the current user is the recipient
    if (!friendRequest.recipient.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to accept this request'
      });
    }

    // Check if already accepted
    if (friendRequest.status === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Friend request already accepted'
      });
    }

    // Update status to accepted
    friendRequest.status = 'accepted';
    await friendRequest.save();

    res.json({
      success: true,
      message: 'Friend request accepted',
      friendship: friendRequest
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting friend request',
      error: error.message
    });
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    // Find the friend request
    const friendRequest = await Friend.findById(requestId);
    
    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    // Verify the current user is the recipient
    if (!friendRequest.recipient.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject this request'
      });
    }

    // Delete the request
    await Friend.findByIdAndDelete(requestId);

    res.json({
      success: true,
      message: 'Friend request rejected'
    });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting friend request',
      error: error.message
    });
  }
};

// Remove friend
export const removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    // Find and delete the friendship
    const friendship = await Friend.findOneAndDelete({
      $or: [
        { requester: userId, recipient: friendId },
        { requester: friendId, recipient: userId }
      ],
      status: 'accepted'
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Friendship not found'
      });
    }

    res.json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing friend',
      error: error.message
    });
  }
};

// Cancel sent friend request
export const cancelFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipientId } = req.params;

    // Find and delete the pending request sent by current user
    const friendRequest = await Friend.findOneAndDelete({
      requester: userId,
      recipient: recipientId,
      status: 'pending'
    });

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    res.json({
      success: true,
      message: 'Friend request cancelled'
    });
  } catch (error) {
    console.error('Cancel friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling friend request',
      error: error.message
    });
  }
};

// Get mutual friends count
const getMutualFriendsCount = async (user1Id, user2Id) => {
  try {
    // Get friends of user1
    const user1Friends = await Friend.find({
      $or: [
        { requester: user1Id, status: 'accepted' },
        { recipient: user1Id, status: 'accepted' }
      ]
    });

    const user1FriendIds = user1Friends.map(f => 
      f.requester.equals(user1Id) ? f.recipient.toString() : f.requester.toString()
    );

    // Get friends of user2
    const user2Friends = await Friend.find({
      $or: [
        { requester: user2Id, status: 'accepted' },
        { recipient: user2Id, status: 'accepted' }
      ]
    });

    const user2FriendIds = user2Friends.map(f => 
      f.requester.equals(user2Id) ? f.recipient.toString() : f.requester.toString()
    );

    // Find mutual friends
    const mutualFriends = user1FriendIds.filter(id => user2FriendIds.includes(id));
    return mutualFriends.length;
  } catch (error) {
    console.error('Error calculating mutual friends:', error);
    return 0;
  }
};

// Get mutual friends list
export const getMutualFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    // Get friends of current user
    const userFriends = await Friend.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    });

    const userFriendIds = userFriends.map(f => 
      f.requester.equals(userId) ? f.recipient : f.requester
    );

    // Get friends of the other user
    const otherUserFriends = await Friend.find({
      $or: [
        { requester: friendId, status: 'accepted' },
        { recipient: friendId, status: 'accepted' }
      ]
    });

    const otherUserFriendIds = otherUserFriends.map(f => 
      f.requester.equals(friendId) ? f.recipient : f.requester
    );

    // Find mutual friend IDs
    const mutualFriendIds = userFriendIds.filter(id => 
      otherUserFriendIds.some(otherId => otherId.equals(id))
    );

    // Get mutual friends details
    const mutualFriends = await JobSeeker.find({
      _id: { $in: mutualFriendIds }
    }).select('fullName email location experience');

    const mutualFriendsList = mutualFriends.map(user => ({
      id: user._id,
      name: user.fullName || 'Anonymous User',
      email: user.email,
      location: user.location || 'Location not specified',
      role: user.experience?.[0]?.title || 'Job Seeker',
      company: user.experience?.[0]?.company || 'Not specified'
    }));

    res.json({
      success: true,
      mutualFriends: mutualFriendsList,
      count: mutualFriendsList.length
    });
  } catch (error) {
    console.error('Get mutual friends error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mutual friends',
      error: error.message
    });
  }
};

// Search users (potential friends)
export const searchUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    // Search users by name, email, or skills
    const users = await JobSeeker.find({
      _id: { $ne: userId },
      $or: [
        { fullName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { skills: { $regex: query, $options: 'i' } }
      ]
    }).limit(20).select('fullName email location experience skills');

    const searchResults = await Promise.all(users.map(async user => {
      const friendship = await Friend.getFriendship(userId, user._id);
      const mutualCount = await getMutualFriendsCount(userId, user._id);

      return {
        id: user._id,
        name: user.fullName || 'Anonymous User',
        email: user.email,
        location: user.location || 'Location not specified',
        role: user.experience?.[0]?.title || 'Job Seeker',
        company: user.experience?.[0]?.company || 'Not specified',
        skills: user.skills || [],
        mutualFriends: mutualCount,
        friendshipStatus: friendship ? friendship.status : null,
        avatar: null
      };
    }));

    res.json({
      success: true,
      results: searchResults
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users',
      error: error.message
    });
  }
};