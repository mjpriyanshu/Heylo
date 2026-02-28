import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';


// Create Express app and Http server
const app = express();
const server = http.createServer(app);

// Create Socket.io server
export const io = new Server(server, {
    cors: {origin: "*"}
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
app.use(cors());


//Route Setup
app.get('/', (req, res) => res.send('Chat App Server is Running! 🚀')); // remove later if face problem
app.use('/api/status', (req, res) => res.send('Server is Live'));
// Import routes
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter)




// Connect to MongoDB
await connectDB();
if(process.env.NODE_ENV !== 'production'){
    // define port 
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

export default server; // Export the server for testing or other purposes[vercel]