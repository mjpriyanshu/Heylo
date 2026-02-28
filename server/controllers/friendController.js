import User from "../models/User.js";

// Search users by exact username (case-sensitive) or by name (public accounts only)
export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.user._id;

        if (!query || !query.trim()) {
            return res.json({ success: false, message: "Search query is required" });
        }

        const searchQuery = query.trim();
        
        // Search logic:
        // 1. Exact username match (case-sensitive) - works for all accounts
        // 2. Full name match (case-insensitive) - only for public accounts
        const users = await User.find({
            _id: { $ne: userId },
            $or: [
                { username: searchQuery },  // Exact username match (case-sensitive)
                { 
                    fullName: { $regex: searchQuery, $options: 'i' },  // Name search
                    isPublic: true  // Only search names for public accounts
                }
            ]
        }).select('fullName username email profilePic bio isPublic');

        if(users.length === 0) {
            return res.json({ success: false, message: "No users found" });
        }

        res.json({ success: true, users });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Send friend request
export const sendFriendRequest = async (req, res) => {
    try {
        const { recipientId } = req.body;
        const senderId = req.user._id;

        if (senderId.toString() === recipientId) {
            return res.json({ success: false, message: "Cannot send friend request to yourself" });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.json({ success: false, message: "User not found" });
        }

        // Check if already friends
        if (req.user.friends.includes(recipientId)) {
            return res.json({ success: false, message: "Already friends with this user" });
        }

        // Check if request already sent
        if (req.user.friendRequestsSent.includes(recipientId)) {
            return res.json({ success: false, message: "Friend request already sent" });
        }

        // Check if received request from this user (suggest accepting instead)
        if (req.user.friendRequestsReceived.includes(recipientId)) {
            return res.json({ success: false, message: "This user has already sent you a friend request. Please accept it instead." });
        }

        // Add to sender's sent requests
        await User.findByIdAndUpdate(senderId, {
            $push: { friendRequestsSent: recipientId }
        });

        // Add to recipient's received requests
        await User.findByIdAndUpdate(recipientId, {
            $push: { friendRequestsReceived: senderId }
        });

        res.json({ success: true, message: "Friend request sent successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
    try {
        const { senderId } = req.body;
        const recipientId = req.user._id;

        // Verify the request exists
        if (!req.user.friendRequestsReceived.includes(senderId)) {
            return res.json({ success: false, message: "Friend request not found" });
        }

        // Add each other as friends
        await User.findByIdAndUpdate(recipientId, {
            $push: { friends: senderId },
            $pull: { friendRequestsReceived: senderId }
        });

        await User.findByIdAndUpdate(senderId, {
            $push: { friends: recipientId },
            $pull: { friendRequestsSent: recipientId }
        });

        res.json({ success: true, message: "Friend request accepted" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Reject or cancel friend request
export const rejectFriendRequest = async (req, res) => {
    try {
        const { senderId } = req.body;
        const recipientId = req.user._id;

        // Remove from received requests
        await User.findByIdAndUpdate(recipientId, {
            $pull: { friendRequestsReceived: senderId }
        });

        // Remove from sender's sent requests
        await User.findByIdAndUpdate(senderId, {
            $pull: { friendRequestsSent: recipientId }
        });

        res.json({ success: true, message: "Friend request rejected" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Cancel a sent friend request
export const cancelFriendRequest = async (req, res) => {
    try {
        const { recipientId } = req.body;
        const senderId = req.user._id;

        // Remove from sender's sent requests
        await User.findByIdAndUpdate(senderId, {
            $pull: { friendRequestsSent: recipientId }
        });

        // Remove from recipient's received requests
        await User.findByIdAndUpdate(recipientId, {
            $pull: { friendRequestsReceived: senderId }
        });

        res.json({ success: true, message: "Friend request cancelled" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get all friends
export const getFriends = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const user = await User.findById(userId).populate('friends', 'fullName username email profilePic bio');
        
        res.json({ success: true, friends: user.friends });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get pending friend requests (received)
export const getPendingRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const user = await User.findById(userId).populate('friendRequestsReceived', 'fullName username email profilePic bio');
        
        res.json({ success: true, requests: user.friendRequestsReceived });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get sent friend requests
export const getSentRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const user = await User.findById(userId).populate('friendRequestsSent', 'fullName username email profilePic bio');
        
        res.json({ success: true, sentRequests: user.friendRequestsSent });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Remove friend
export const removeFriend = async (req, res) => {
    try {
        const { friendId } = req.body;
        const userId = req.user._id;

        // Remove from both users' friend lists
        await User.findByIdAndUpdate(userId, {
            $pull: { friends: friendId }
        });

        await User.findByIdAndUpdate(friendId, {
            $pull: { friends: userId }
        });

        res.json({ success: true, message: "Friend removed successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
