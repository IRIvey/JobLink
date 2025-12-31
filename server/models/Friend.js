import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSeeker',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSeeker',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate friend requests
friendSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Index for quick lookups
friendSchema.index({ requester: 1, status: 1 });
friendSchema.index({ recipient: 1, status: 1 });

// Update timestamp on save
friendSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to check if friendship exists
friendSchema.statics.getFriendship = async function(user1Id, user2Id) {
  return await this.findOne({
    $or: [
      { requester: user1Id, recipient: user2Id },
      { requester: user2Id, recipient: user1Id }
    ]
  });
};

// Static method to get friendship status between two users
friendSchema.statics.getStatus = async function(user1Id, user2Id) {
  const friendship = await this.getFriendship(user1Id, user2Id);
  if (!friendship) return null;
  return friendship.status;
};

// Static method to check if users are friends
friendSchema.statics.areFriends = async function(user1Id, user2Id) {
  const friendship = await this.getFriendship(user1Id, user2Id);
  return friendship && friendship.status === 'accepted';
};

export default mongoose.models.Friend || mongoose.model("Friend", friendSchema);