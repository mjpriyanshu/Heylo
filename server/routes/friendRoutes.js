import express from 'express';
import { protectRoute } from '../middleware/auth.js';
import { 
    searchUsers, 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest,
    cancelFriendRequest,
    getFriends, 
    getPendingRequests,
    getSentRequests,
    removeFriend
} from '../controllers/friendController.js';

const friendRouter = express.Router();

// All routes require authentication
friendRouter.use(protectRoute);

// Search for users
friendRouter.get('/search', searchUsers);

// Friend request operations
friendRouter.post('/request/send', sendFriendRequest);
friendRouter.post('/request/accept', acceptFriendRequest);
friendRouter.post('/request/reject', rejectFriendRequest);
friendRouter.post('/request/cancel', cancelFriendRequest);

// Get friends and requests
friendRouter.get('/list', getFriends);
friendRouter.get('/requests/pending', getPendingRequests);
friendRouter.get('/requests/sent', getSentRequests);

// Remove friend
friendRouter.post('/remove', removeFriend);

export default friendRouter;
