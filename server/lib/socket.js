import { Server } from 'socket.io';

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

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        console.log('User connected', userId);

        if (userId) userSocketMap[userId] = socket.id;

        io.emit('getOnlineUsers', Object.keys(userSocketMap));

        socket.on('disconnect', () => {
            console.log('User disconnected', userId);
            delete userSocketMap[userId];

            io.emit('getOnlineUsers', Object.keys(userSocketMap));
        });
    });

    return io;
};
