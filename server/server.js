import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import friendRouter from './routes/friendRoutes.js';
import { Server } from 'socket.io';


// Create Express app and Http server
const app = express();
const server = http.createServer(app);
app.set('trust proxy', 1);

const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
};

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 25,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many authentication attempts, please try again later.' }
});

// Create Socket.io server
export const io = new Server(server, {
    cors: {
        origin: allowedOrigins.length > 0 ? allowedOrigins : true,
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    allowEIO3: true
})

//Store Online Users
export const userSocketMap = {};    //{userId: socketId}

// Socket.io connection Handler
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    console.log('User connected', userId);

    if(userId) userSocketMap[userId] = socket.id;

    //Emit online users to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        console.log('User disconnected', userId);
        delete userSocketMap[userId];

        //Emit online users to all clients
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

// Middleware
app.use(express.json({limit: '4mb'}));  //files upload only up to 4mb
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(globalLimiter);


//Route Setup
app.get('/', (req, res) => res.send('Chat App Server is Running! 🚀')); // remove later if face problem
app.use('/api/status', (req, res) => res.send('Server is Live'));
// Import routes
app.use('/api/auth', authLimiter, userRouter);
app.use('/api/messages', messageRouter);
app.use('/api/friends', friendRouter);




// Connect to MongoDB
await connectDB();
if(process.env.NODE_ENV !== 'production'){
    // define port 
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

export default server; // Export the server for testing or other purposes[vercel]