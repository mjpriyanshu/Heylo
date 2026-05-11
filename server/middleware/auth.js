import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const cache = new Map();

// Middleware for authentication

export const protectRoute = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader?.startsWith('Bearer ')
            ? authHeader.slice(7)
            : null;
        const token = req.cookies?.token || bearerToken || req.headers.token;

        if (!token) {
            return res.json({success: false, message: "No token provided"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const cacheKey = `auth_user_${decoded.userId}`;
        
        let user;
        if (cache.has(cacheKey)) {
            user = cache.get(cacheKey);
        } else {
            user = await User.findById(decoded.userId).select('-password -resetPasswordToken -resetPasswordExpires');
            if (!user) {
                return res.json({success: false, message: "User not found"});
            }
            cache.set(cacheKey, user);
            setTimeout(() => cache.delete(cacheKey), 10000); // 10s TTL
        }

        req.user = user;
        next();
    } catch (error) {
        res.json({success: false, message: "Authentication failed"});
        console.error(error.message);
    }
}