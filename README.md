# Heylo - Real-time Chat Application 💬

A modern, full-stack real-time chat application built with React, Node.js, Socket.io, and MongoDB. Features include real-time messaging, user authentication, online status indicators, image sharing, and a beautiful responsive UI.

## 🚀 Features

- **Real-time Messaging**: Instant message delivery using Socket.io
- **User Authentication**: Secure JWT-based authentication
- **Online Status**: See who's currently online
- **Image Sharing**: Send and receive images in chat
- **Profile Management**: Update profile picture and bio
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Modern UI**: Beautiful interface built with React and Tailwind CSS
- **Message Status**: See if messages have been read
- **Cloud Storage**: Images stored securely using Cloudinary

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Cloud-based image storage
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
ChatApp/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ChatContainer.jsx
│   │   │   ├── RightSidebar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── assets/         # Static assets
│   │   ├── lib/            # Utility functions
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── context/            # React contexts
│   │   ├── AuthContext.jsx # Authentication state
│   │   └── ChatContext.jsx # Chat state
│   ├── public/             # Public assets
│   └── package.json
│
└── server/                 # Node.js backend
    ├── controllers/        # Route handlers
    │   ├── messageController.js
    │   └── userController.js
    ├── models/             # Database models
    │   ├── Message.js
    │   └── User.js
    ├── routes/             # API routes
    │   ├── messageRoutes.js
    │   └── userRoutes.js
    ├── middleware/         # Custom middleware
    │   └── auth.js
    ├── lib/                # Utility functions
    │   ├── cloudinary.js   # Cloudinary config
    │   ├── db.js           # Database connection
    │   └── utils.js
    ├── server.js           # Main server file
    └── package.json
```

## 🔄 Application Flow

### 1. User Authentication Flow
```
User Registration/Login → JWT Token Generation → Local Storage → Authentication Context → Protected Routes
```

### 2. Real-time Communication Flow
```
User Login → Socket Connection → Join Room → Send Message → Socket.io Broadcast → Receive Message → UI Update
```

### 3. Message Flow
```
User Types Message → Send via Socket.io → Server Validates → Save to MongoDB → Broadcast to Recipient → UI Update
```

### 4. Image Sharing Flow
```
User Selects Image → File Reader → Base64 Conversion → Cloudinary Upload → URL Storage → Message with Image URL
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/mjpriyanshu/Heylo.git
cd ChatApp
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Environment Setup**

Create `.env` file in the `server` directory:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Create `.env` file in the `client` directory:
```env
VITE_BACKEND_URL=http://localhost:3000
```

5. **Start the development servers**

Start the backend server:
```bash
cd server
npm run server
```

Start the frontend development server:
```bash
cd client
npm run dev
```

6. **Access the application**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## 🌐 Vercel Deployment Setup

### Frontend Deployment (Client)

1. **Prepare for deployment**
   - Ensure your `client/vercel.json` is configured for SPA routing:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/"
       }
     ]
   }
   ```

2. **Update environment variables**
   - Create `.env.production` in client directory:
   ```env
   VITE_BACKEND_URL=https://your-backend-domain.vercel.app
   ```

3. **Deploy to Vercel**
   ```bash
   cd client
   vercel --prod
   ```

4. **Configure Vercel Dashboard**
   - Go to your Vercel dashboard
   - Add environment variables:
     - `VITE_BACKEND_URL`: Your backend URL

### Backend Deployment (Server)

1. **Prepare server for Vercel**
   - Ensure your `server/vercel.json` is properly configured:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node",
         "config": {
           "includeFiles": ["dist/**"]
         }
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server.js"
       }
     ]
   }
   ```

2. **Update server.js for production**
   - The conditional port setup is already configured:
   ```javascript
   if(process.env.NODE_ENV !== 'production'){
       const PORT = process.env.PORT || 3000;
       server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
   }
   export default server; // For Vercel
   ```

3. **Deploy backend to Vercel**
   ```bash
   cd server
   vercel --prod
   ```

4. **Configure Vercel Environment Variables**
   - In Vercel dashboard, add these environment variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Your JWT secret key
     - `NODE_ENV`: `production`
     - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
     - `CLOUDINARY_API_KEY`: Your Cloudinary API key
     - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

### Post-Deployment Steps

1. **Update CORS settings** (if needed)
   - Update your backend CORS configuration to include your frontend domain

2. **Test the deployment**
   - Verify all features work in production
   - Test real-time messaging
   - Test image uploads
   - Test user authentication

3. **Domain Configuration** (Optional)
   - Configure custom domains in Vercel dashboard
   - Update environment variables with new domains

## 📱 Usage

1. **Registration/Login**: Create an account or login with existing credentials
2. **Profile Setup**: Upload a profile picture and add a bio
3. **Start Chatting**: Select a user from the sidebar to start a conversation
4. **Send Messages**: Type messages and press Enter to send
5. **Share Images**: Click the gallery icon to share images
6. **Real-time Updates**: See online users and receive messages instantly

## 🔧 Development Scripts

### Client Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Server Scripts
```bash
npm run server   # Start development server with nodemon
npm start        # Start production server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 👨‍💻 Author

**Priyanshu** - [GitHub](https://github.com/mjpriyanshu)
