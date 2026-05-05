import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import {io, userSocketMap} from "../server.js";

// Get all friends for sidebar (only friends can chat)
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id; 
        
        // Get user with populated friends
        const user = await User.findById(userId).populate('friends', '-password');
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const filteredUsers = user.friends;
        const friendIds = filteredUsers.map((friend) => friend._id);

        // Count unseen messages in a single query (fixes N+1)
        const unseenMessages = {};
        if (friendIds.length) {
            const unreadCounts = await Message.aggregate([
                {
                    $match: {
                        receiverId: userId,
                        seen: false,
                        senderId: { $in: friendIds },
                    },
                },
                { $group: { _id: "$senderId", count: { $sum: 1 } } },
            ]);

            for (const row of unreadCounts) {
                unseenMessages[String(row._id)] = row.count;
            }
        }

        res.json({ success: true, users: filteredUsers, unseenMessages });
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: "Failed to fetch users"});
    }
}


// Get messages for selected user (only if they are friends)
export const getMessages = async (req, res) => {
    try {
        const {id : selectedUserId} = req.params;
        const myId = req.user._id;

        const limitRaw = Number.parseInt(req.query.limit, 10);
        const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 50;

        const cursorRaw = req.query.cursor;
        const cursorDate = cursorRaw ? new Date(cursorRaw) : null;
        if (cursorRaw && Number.isNaN(cursorDate.getTime())) {
            return res.json({ success: false, message: "Invalid cursor" });
        }

        // Check if users are friends
        const user = await User.findById(myId);
        if (!user.friends.includes(selectedUserId)) {
            return res.json({ success: false, message: "You can only view messages from your friends" });
        }

        const query = {
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ]
        };

        if (cursorDate) {
            query.createdAt = { $lt: cursorDate };
        }

        // Fetch newest first for efficiency, then reverse for UI-friendly oldest->newest ordering.
        let messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(limit + 1)
            .lean();

        const hasMore = messages.length > limit;
        messages = messages.slice(0, limit);
        const nextCursor = messages.length ? messages[messages.length - 1].createdAt : null;
        messages.reverse();

        // Mark messages as seen if they are from the selected user
        await Message.updateMany(
            { senderId: selectedUserId, receiverId: myId},
            { seen: true }
        );

        res.json({
            success: true,
            messages,
            pagination: {
                limit,
                hasMore,
                nextCursor,
            },
        });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: "Failed to fetch messages" });
    }
}



// API to mark messages as seen
export const markMessagesAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen: true });
        res.json({ success: true, message: "Message marked as seen" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: "Failed to mark messages as seen" });
    }
}


// Send a message to a user (only if they are friends)
export const sendMessage = async (req, res) => {
    try {
        const {text, image} = req.body;
        const receiverId = req.params.id; // ID of the user to whom the message is sent
        const senderId = req.user._id;

        // Check if users are friends
        const sender = await User.findById(senderId);
        if (!sender.friends.includes(receiverId)) {
            return res.json({ success: false, message: "You can only send messages to your friends" });
        }

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        // Emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.json({ success: true, newMessage });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: "Failed to send message" });
    }
}