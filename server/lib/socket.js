import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

export const userSocketMap = {}; // { userId: socketId }
export let io;

export const initSocket = (httpServer, allowedOrigins = []) => {
    if (io) return io;

    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins.length > 0 ? allowedOrigins : true,
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
        transports: ['websocket', 'polling'],
        allowEIO3: true,
    });

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.headers?.token;
            if (!token) {
                return next(new Error('Unauthorized'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            return next();
        } catch {
            return next(new Error('Unauthorized'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.userId;
        console.log('User connected', userId);

        if (userId) userSocketMap[String(userId)] = socket.id;

        io.emit('getOnlineUsers', Object.keys(userSocketMap));

        socket.on('typing', (payload = {}) => {
            const toUserId = payload?.toUserId;
            if (!toUserId) return;

            const receiverSocketId = userSocketMap[String(toUserId)];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('typing', { fromUserId: String(userId) });
            }
        });

        socket.on('stopTyping', (payload = {}) => {
            const toUserId = payload?.toUserId;
            if (!toUserId) return;

            const receiverSocketId = userSocketMap[String(toUserId)];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('stopTyping', { fromUserId: String(userId) });
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected', userId);
            delete userSocketMap[String(userId)];

            io.emit('getOnlineUsers', Object.keys(userSocketMap));
        });
    });

    return io;
};
