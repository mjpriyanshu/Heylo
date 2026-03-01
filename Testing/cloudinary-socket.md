# Cloudinary & Socket.io Integration Documentation

## Overview
This document covers two critical real-time and media handling integrations:
1. **Cloudinary** - Cloud storage for profile pictures and message images
2. **Socket.io** - Real-time bidirectional communication for messaging and notifications

---

# Part 1: Cloudinary Integration

## Configuration

### Installation
```bash
npm install cloudinary
```

**Version:** `cloudinary@2.7.0`

### Environment Variables
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Cloudinary Setup File
**Location:** `server/lib/cloudinary.js`

```javascript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;
```

---

## Use Cases

### 1. Profile Picture Upload
**Controller:** `server/controllers/userController.js` - `updateProfile()`

**Process:**
1. User selects image file in ProfilePage
2. Frontend converts image to base64 string
3. Sends base64 string in PUT request to `/api/auth/update-profile`
4. Backend uploads to Cloudinary with custom folder
5. Returns secure HTTPS URL
6. URL saved to `profilePic` field in User model

**Code Example:**
```javascript
// Backend upload
if (profilePic) {
  const uploadResponse = await cloudinary.uploader.upload(profilePic, {
    folder: 'heylo/profile-pictures',
    resource_type: 'auto'
  });
  user.profilePic = uploadResponse.secure_url;
}
```

**Frontend Example:**
```javascript
// Convert file to base64
const reader = new FileReader();
reader.onloadend = () => {
  const base64String = reader.result;
  // Send to backend
  updateProfile({ profilePic: base64String });
};
reader.readAsDataURL(file);
```

---

### 2. Message Image Upload
**Controller:** `server/controllers/messageController.js` - `sendMessage()`

**Process:**
1. User attaches image to message
2. Frontend converts image to base64
3. Sends to `/api/messages/send/:userId` with `image` field
4. Backend uploads to Cloudinary
5. Returns image URL in message object
6. URL saved in Message model
7. Real-time delivery via Socket.io

**Code Example:**
```javascript
// Backend upload
let imageUrl = null;
if (image) {
  const uploadResponse = await cloudinary.uploader.upload(image, {
    folder: 'heylo/message-images',
    resource_type: 'auto'
  });
  imageUrl = uploadResponse.secure_url;
}

const newMessage = new Message({
  senderId: req.user._id,
  receiverId: userId,
  text,
  image: imageUrl
});
```

---

## Cloudinary Folder Structure

```
heylo/
├── profile-pictures/
│   ├── user123_abc456.jpg
│   ├── user789_def789.png
│   └── ...
└── message-images/
    ├── msg001_ghi012.jpg
    ├── msg002_jkl345.png
    └── ...
```

**Benefits:**
- Organized storage
- Easy bulk operations
- Better asset management
- Simplified backups

---

## Image Optimization

### Automatic Optimizations
Cloudinary automatically applies:
- Format conversion (WebP for modern browsers)
- Quality compression (80% default)
- Responsive images (srcset generation)
- Lazy loading support

### Custom Transformations
Can be applied via URL parameters:

**Profile Picture Thumbnail:**
```javascript
const thumbnailUrl = cloudinary.url('heylo/profile-pictures/user123.jpg', {
  width: 150,
  height: 150,
  crop: 'fill',
  gravity: 'face',
  quality: 'auto',
  fetch_format: 'auto'
});
```

**Resulting URL:**
```
https://res.cloudinary.com/your-cloud/image/upload/w_150,h_150,c_fill,g_face,q_auto,f_auto/heylo/profile-pictures/user123.jpg
```

---

## Error Handling

### Common Cloudinary Errors

**1. Invalid API Credentials**
```javascript
// Error: Must supply api_key
if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error('Cloudinary API key not configured');
}
```

**2. Upload Failure**
```javascript
try {
  const uploadResponse = await cloudinary.uploader.upload(image);
} catch (error) {
  console.error('Cloudinary upload failed:', error);
  return res.status(500).json({ error: 'Failed to upload image' });
}
```

**3. Invalid Image Format**
```javascript
// Cloudinary automatically handles most formats
// For strict validation, check MIME type before upload
const validFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!validFormats.includes(file.mimetype)) {
  return res.status(400).json({ error: 'Invalid image format' });
}
```

---

## Best Practices

### 1. File Size Limits
```javascript
// Frontend validation (before upload)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
if (file.size > MAX_FILE_SIZE) {
  toast.error('Image must be less than 5MB');
  return;
}
```

### 2. Image Compression (Frontend)
```javascript
// Use browser-image-compression library
import imageCompression from 'browser-image-compression';

const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true
};
const compressedFile = await imageCompression(file, options);
```

### 3. Delete Old Images (Optional)
```javascript
// Extract public_id from old URL
const getPublicId = (url) => {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const publicId = `heylo/profile-pictures/${filename.split('.')[0]}`;
  return publicId;
};

// Delete old image before uploading new one
if (user.profilePic && user.profilePic.includes('cloudinary')) {
  const oldPublicId = getPublicId(user.profilePic);
  await cloudinary.uploader.destroy(oldPublicId);
}
```

---

## Cloudinary Dashboard

**Access:** https://console.cloudinary.com/

**Features:**
- View all uploaded images
- Manually upload/delete assets
- Monitor bandwidth usage
- Configure transformations
- Manage folders and tags
- Analytics and insights

---

# Part 2: Socket.io Integration

## Configuration

### Installation
```bash
# Server
npm install socket.io

# Client
npm install socket.io-client
```

**Versions:**
- Server: `socket.io@4.8.1`
- Client: `socket.io-client@4.8.1`

---

## Server Setup

### Socket.io Server Configuration
**Location:** `server/server.js`

```javascript
import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,    // 60 seconds before considering connection dead
  pingInterval: 25000,   // Send ping every 25 seconds
  transports: ['websocket', 'polling'],  // Try websocket first, fallback to polling
  allowEIO3: true        // Allow Engine.IO v3 clients
});

export { io, server, app };
```

### Configuration Breakdown

**CORS Settings:**
- `origin: "*"` - Allow all origins (restrict in production to specific domains)
- `methods: ["GET", "POST"]` - Allowed HTTP methods for Socket.io handshake

**Connection Health:**
- `pingTimeout: 60000` - Wait 60s for pong before disconnecting
- `pingInterval: 25000` - Send ping every 25s to check connection health
- Prevents false disconnections on slow networks

**Transport Fallback:**
- `transports: ['websocket', 'polling']` - Try WebSocket first for low latency
- Falls back to HTTP long-polling if WebSocket blocked (corporate firewalls)

---

## User Socket Mapping

### userSocketMap Object
Tracks which socket ID belongs to which user ID.

```javascript
// In-memory storage (resets on server restart)
const userSocketMap = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    
    // Broadcast online users to all clients
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  }

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});
```

**Structure Example:**
```javascript
{
  "65f123abc...": "socket-id-abc123",
  "65f456def...": "socket-id-def456",
  "65f789ghi...": "socket-id-ghi789"
}
```

---

## Socket Events

### Server-Side Events

#### 1. **connection**
Fired when a client connects.

```javascript
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  userSocketMap[userId] = socket.id;
  io.emit('getOnlineUsers', Object.keys(userSocketMap));
});
```

#### 2. **disconnect**
Fired when a client disconnects.

```javascript
socket.on('disconnect', () => {
  delete userSocketMap[userId];
  io.emit('getOnlineUsers', Object.keys(userSocketMap));
});
```

#### 3. **newMessage** (Emit to Recipient)
Sent when a new message is created.

**Location:** `server/controllers/messageController.js`

```javascript
const receiverSocketId = userSocketMap[receiverId];
if (receiverSocketId) {
  io.to(receiverSocketId).emit('newMessage', newMessage);
}
```

#### 4. **friendRequestSent** (Emit to Recipient)
Sent when a friend request is sent.

```javascript
const recipientSocketId = userSocketMap[recipientId];
if (recipientSocketId) {
  io.to(recipientSocketId).emit('friendRequestReceived', {
    from: req.user._id,
    username: req.user.username,
    profilePic: req.user.profilePic
  });
}
```

---

### Client-Side Events

#### 1. **connect**
Fired when client successfully connects.

**Location:** `client/context/AuthContext.jsx`

```javascript
socket.on('connect', () => {
  console.log('✅ Connected to Socket.io server');
});
```

#### 2. **disconnect**
Fired when client loses connection.

```javascript
socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected from Socket.io:', reason);
});
```

#### 3. **reconnect**
Fired after successful reconnection.

```javascript
socket.on('reconnect', (attemptNumber) => {
  console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
});
```

#### 4. **getOnlineUsers**
Receives list of online user IDs.

```javascript
socket.on('getOnlineUsers', (users) => {
  setOnlineUsers(users);
});
```

#### 5. **newMessage**
Receives real-time message from server.

**Location:** `client/context/ChatContext.jsx`

```javascript
socket.on('newMessage', (message) => {
  // Only add message if it's for the currently selected conversation
  if (selectedUser && message.senderId === selectedUser._id) {
    setMessages((prev) => [...prev, message]);
  }
});
```

---

## Client Configuration

### Socket Connection Setup
**Location:** `client/context/AuthContext.jsx`

```javascript
import { io } from 'socket.io-client';

const connectSocket = (userId) => {
  if (!socket) {
    const newSocket = io('http://localhost:5000', {
      query: { userId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });
    
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
    });
    
    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });
    
    newSocket.on('reconnect', (attempt) => {
      console.log('🔄 Reconnected after', attempt, 'attempts');
    });
  }
};
```

### Reconnection Configuration

**Settings:**
- `reconnection: true` - Enable automatic reconnection
- `reconnectionAttempts: 5` - Try reconnecting 5 times
- `reconnectionDelay: 1000` - Start with 1 second delay
- `reconnectionDelayMax: 5000` - Max 5 seconds between attempts
- `timeout: 20000` - 20 second connection timeout

**Reconnection Backoff:**
```
Attempt 1: 1 second delay
Attempt 2: 2 seconds delay
Attempt 3: 3 seconds delay
Attempt 4: 4 seconds delay
Attempt 5: 5 seconds delay (max)
```

---

## Real-Time Message Flow

### Complete Message Journey

```
[User A sends message]
    |
    v
[Frontend: sendMessage() in ChatContext]
    |
    v
[POST /api/messages/send/:userId]
    |
    v
[Backend: messageController.sendMessage()]
    |
    ├─> Save message to MongoDB
    |
    ├─> Get recipient's socket ID from userSocketMap
    |
    └─> io.to(receiverSocketId).emit('newMessage', message)
            |
            v
    [User B's Socket.io client receives 'newMessage' event]
            |
            v
    [Frontend: ChatContext socket listener]
            |
            v
    [Update messages state with new message]
            |
            v
    [UI automatically re-renders with new message]
```

---

## Troubleshooting

### Issue 1: Connection Flickering (Green Dot On/Off)

**Symptoms:**
- Online status indicator flickers
- `getOnlineUsers` event fires repeatedly
- Console shows connect/disconnect cycles

**Causes:**
- `pingTimeout` too short for user's network
- Multiple socket connections from same user
- Network instability or firewall interference

**Solutions:**
1. Increase `pingTimeout` on server:
```javascript
pingTimeout: 60000,  // Increase from 10s to 60s
pingInterval: 25000  // Increase from 5s to 25s
```

2. Prevent duplicate connections:
```javascript
// Disconnect old socket before creating new one
if (socket) {
  socket.disconnect();
  setSocket(null);
}
```

3. Add connection state tracking:
```javascript
const [isConnected, setIsConnected] = useState(false);

socket.on('connect', () => {
  setIsConnected(true);
});

socket.on('disconnect', () => {
  setIsConnected(false);
});
```

---

### Issue 2: Messages Not Appearing in Real-Time

**Symptoms:**
- Messages only appear after refreshing page
- Sender sees message but recipient doesn't
- `newMessage` event not firing

**Causes:**
- Socket listener has stale closure (old `selectedUser` value)
- Socket not connected when message sent
- Recipient's socket ID not in `userSocketMap`

**Solutions:**
1. Use `useRef` to prevent stale closure:
```javascript
const selectedUserRef = useRef(selectedUser);

useEffect(() => {
  selectedUserRef.current = selectedUser;
}, [selectedUser]);

socket.on('newMessage', (message) => {
  if (selectedUserRef.current && message.senderId === selectedUserRef.current._id) {
    setMessages((prev) => [...prev, message]);
  }
});
```

2. Check socket connection before sending:
```javascript
if (socket && socket.connected) {
  sendMessage(messageData);
} else {
  console.error('Socket not connected, reconnecting...');
  connectSocket(authUser._id);
}
```

3. Log socket events for debugging:
```javascript
socket.onAny((eventName, ...args) => {
  console.log(`Socket event: ${eventName}`, args);
});
```

---

### Issue 3: Memory Leaks from Socket Listeners

**Symptoms:**
- App becomes slow over time
- Multiple listeners registered for same event
- Console shows duplicate event logs

**Cause:**
- Socket listeners not cleaned up in `useEffect`

**Solution:**
```javascript
useEffect(() => {
  if (!socket) return;
  
  const handleNewMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };
  
  socket.on('newMessage', handleNewMessage);
  
  // Cleanup function
  return () => {
    socket.off('newMessage', handleNewMessage);
  };
}, [socket]);
```

---

### Issue 4: CORS Errors

**Symptoms:**
- Browser console shows CORS policy error
- Socket.io handshake fails
- Network tab shows failed OPTIONS request

**Solution:**
```javascript
// Server-side (server.js)
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://yourdomain.com"],
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Client-side (AuthContext.jsx)
const newSocket = io('http://localhost:5000', {
  withCredentials: true,
  transports: ['websocket', 'polling']
});
```

---

## Production Configuration

### Environment Variables
```env
# Backend
SOCKET_IO_CORS_ORIGIN=https://yourdomain.com
# Or multiple origins:
SOCKET_IO_CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com

# Frontend
VITE_SOCKET_URL=https://api.yourdomain.com
```

### Server Config (Production)
```javascript
const allowedOrigins = process.env.SOCKET_IO_CORS_ORIGIN.split(',');

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});
```

### Client Config (Production)
```javascript
const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const newSocket = io(socketUrl, {
  query: { userId },
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000
});
```

---

## Performance Optimization

### 1. Emit to Specific Sockets (Not Broadcast)
```javascript
// ❌ Bad: Broadcasts to ALL connected clients
io.emit('newMessage', message);

// ✅ Good: Sends only to specific recipient
io.to(receiverSocketId).emit('newMessage', message);
```

### 2. Rooms for Group Chats (Future Enhancement)
```javascript
// Join conversation room
socket.join(`conversation:${conversationId}`);

// Emit to room
io.to(`conversation:${conversationId}`).emit('newMessage', message);
```

### 3. Acknowledge Message Delivery
```javascript
// Server
socket.emit('newMessage', message, (ack) => {
  if (ack === 'received') {
    // Mark message as delivered in database
  }
});

// Client
socket.on('newMessage', (message, callback) => {
  setMessages((prev) => [...prev, message]);
  callback('received');
});
```

---

## Testing Checklist

### Cloudinary Tests
- [ ] Profile picture upload returns valid HTTPS URL
- [ ] Profile picture appears in chat UI
- [ ] Message image upload works in conversation
- [ ] Image viewer modal displays Cloudinary images
- [ ] Old profile pictures are replaced (not duplicated)
- [ ] Invalid image formats return error
- [ ] File size limits are enforced (5MB)

### Socket.io Tests
- [ ] Client connects successfully on login
- [ ] Online users list updates when user connects
- [ ] Online users list updates when user disconnects
- [ ] Real-time message appears on recipient's screen
- [ ] Message appears only in correct conversation
- [ ] Friend request notification appears in real-time
- [ ] Reconnection works after temporary network loss
- [ ] No duplicate connections for same user
- [ ] Socket disconnects properly on logout

---

## Summary

### Cloudinary Integration
✅ Profile picture uploads to `heylo/profile-pictures/`  
✅ Message image uploads to `heylo/message-images/`  
✅ Returns secure HTTPS URLs for all uploads  
✅ Automatic image optimization and format conversion  
✅ Base64 encoding for file transfers  
✅ Error handling for failed uploads  

### Socket.io Integration
✅ Real-time bidirectional communication  
✅ Online/offline user tracking with `userSocketMap`  
✅ Instant message delivery to specific recipients  
✅ Friend request real-time notifications  
✅ Automatic reconnection with exponential backoff  
✅ Connection health monitoring (ping/pong)  
✅ CORS configuration for cross-origin requests  
✅ Memory leak prevention with listener cleanup  
✅ Stale closure fix using `useRef` pattern  

---

**Last Updated:** 2024  
**Cloudinary Version:** 2.7.0  
**Socket.io Version:** 4.8.1  
**Socket.io-Client Version:** 4.8.1
