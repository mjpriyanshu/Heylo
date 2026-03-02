# Backend Routes Documentation

## Overview
The backend uses **Express 5.1.0** with RESTful API endpoints grouped into three main routers: Authentication, Messages, and Friends.

**Base URL:** `http://localhost:5000` (development)  
**Authentication:** JWT tokens stored in HTTP-only cookies

---

## Authentication Routes (`/api/auth`)

### 1. **POST** `/api/auth/signup`
Create a new user account with two-step signup validation.

**Access:** Public

**Request Body:**
```json
{
  "fullName": "John Doe",
  "username": "johndoe123",
  "email": "john@example.com",
  "password": "securepass123",
  "bio": "Software developer and tech enthusiast",
  "termsAccepted": true
}
```

**Validation Rules:**
- `fullName`: Required, 3-50 characters
- `username`: Required, 3-20 characters, alphanumeric only, case-sensitive unique
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters
- `bio`: Optional, maximum 200 characters
- `termsAccepted`: Required, must be `true`

**Response (201):**
```json
{
  "message": "Account created successfully",
  "user": {
    "_id": "65f123...",
    "fullName": "John Doe",
    "username": "johndoe123",
    "email": "john@example.com",
    "profilePic": "default-avatar.png",
    "bio": "Software developer and tech enthusiast",
    "isPublic": true,
    "friends": [],
    "createdAt": "2024-02-28T10:30:00.000Z"
  }
}
```

**Errors:**
- `400` - Missing required fields
- `400` - Username already exists (case-sensitive check)
- `400` - Email already exists
- `400` - Invalid username format (non-alphanumeric characters)
- `400` - Terms not accepted
- `500` - Server error

**Cookie Set:**
- `token` - HTTP-only JWT token (7 days expiry)

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "username": "johndoe123",
    "email": "john@example.com",
    "password": "securepass123",
    "bio": "Tech enthusiast",
    "termsAccepted": true
  }'
```

---

### 2. **POST** `/api/auth/login`
Authenticate existing user and return JWT token.

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "65f123...",
    "fullName": "John Doe",
    "username": "johndoe123",
    "email": "john@example.com",
    "profilePic": "https://cloudinary.com/...",
    "bio": "Software developer",
    "isPublic": true,
    "friends": ["65f456...", "65f789..."],
    "lastUsernameChange": "2024-01-28T10:30:00.000Z"
  }
}
```

**Errors:**
- `400` - Missing email or password
- `400` - Invalid credentials (wrong email or password)
- `500` - Server error

**Cookie Set:**
- `token` - HTTP-only JWT token (7 days expiry)

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }' \
  -c cookies.txt
```

---

### 3. **POST** `/api/auth/check-username`
Check if a username is available before signup or profile update.

**Access:** Public

**Request Body:**
```json
{
  "username": "newusername123"
}
```

**Response (200):**
```json
{
  "available": true,
  "message": "Username is available"
}
```

**Response (400 - Username Taken):**
```json
{
  "available": false,
  "message": "Username already taken"
}
```

**Validation:**
- Case-sensitive check (e.g., `JohnDoe` ≠ `johndoe`)
- Alphanumeric only (no special characters)
- 3-20 characters length

**Errors:**
- `400` - Missing username
- `400` - Invalid username format
- `500` - Server error

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/check-username \
  -H "Content-Type: application/json" \
  -d '{"username": "newusername123"}'
```

---

### 4. **POST** `/api/auth/forgot-password`
Send password reset email with JWT token (valid for 1 hour).

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset link sent to your email"
}
```

**Email Content:**
- Subject: "Reset Your Password"
- Reset link: `${FRONTEND_URL}/reset-password/${token}`
- Token expiry: 1 hour
- HTML template with branded styling

**Process:**
1. Validate email exists in database
2. Generate JWT token with user ID (expires in 1 hour)
3. Save token and expiry to `resetPasswordToken` and `resetPasswordExpires` fields
4. Send email via Resend API with reset link
5. Return success message

**Errors:**
- `400` - Missing email
- `404` - Email not found in database
- `500` - Server error or email sending failure

**Security:**
- Token is single-use (cleared after successful reset)
- Token expires in 1 hour
- Old tokens are invalidated when new reset is requested

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'
```

---

### 5. **POST** `/api/auth/reset-password`
Reset user password using valid token from email.

**Access:** Public

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "newSecurePass456"
}
```

**Response (200):**
```json
{
  "message": "Password reset successful"
}
```

**Process:**
1. Verify JWT token signature
2. Extract user ID from token payload
3. Find user with matching `resetPasswordToken`
4. Check token hasn't expired (`resetPasswordExpires > Date.now()`)
5. Validate new password (min 6 characters)
6. Hash new password with bcrypt
7. Update user password in database
8. Clear `resetPasswordToken` and `resetPasswordExpires` fields
9. Return success message

**Errors:**
- `400` - Missing token or newPassword
- `400` - Invalid token (malformed JWT)
- `400` - Token expired (>1 hour old)
- `400` - Token not found in database
- `400` - New password too short (<6 characters)
- `500` - Server error

**Security:**
- Token can only be used once (cleared after use)
- Old password is completely replaced (no history)
- User must login again with new password

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "newPassword": "newSecurePass456"
  }'
```

---

### 6. **PUT** `/api/auth/update-profile`
Update user profile information (name, bio, profilePic, username, isPublic).

**Access:** Protected (requires JWT token)

**Headers:**
```
Cookie: token=<jwt-token>
```

**Request Body (multipart/form-data or JSON):**
```json
{
  "fullName": "John Doe Updated",
  "bio": "Senior software engineer",
  "username": "johndoe_new",
  "profilePic": "<file or cloudinary URL>",
  "isPublic": false
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "65f123...",
    "fullName": "John Doe Updated",
    "username": "johndoe_new",
    "email": "john@example.com",
    "profilePic": "https://cloudinary.com/updated.jpg",
    "bio": "Senior software engineer",
    "isPublic": false,
    "lastUsernameChange": "2024-02-28T10:30:00.000Z"
  }
}
```

**Username Change Rules:**
- Can only change once every 30 days
- New username must be available (case-sensitive check)
- Alphanumeric only, 3-20 characters
- `lastUsernameChange` field updated on change

**Errors:**
- `401` - No token provided (authentication required)
- `400` - Username already taken
- `400` - Username changed within last 30 days
- `400` - Invalid username format
- `500` - Server error or Cloudinary upload failure

**cURL Example:**
```bash
curl -X PUT http://localhost:5000/api/auth/update-profile \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "fullName": "John Doe Updated",
    "bio": "Senior software engineer",
    "isPublic": false
  }'
```

---

### 7. **GET** `/api/auth/check`
Verify JWT token and return current user data.

**Access:** Protected (requires JWT token)

**Headers:**
```
Cookie: token=<jwt-token>
```

**Response (200):**
```json
{
  "user": {
    "_id": "65f123...",
    "fullName": "John Doe",
    "username": "johndoe123",
    "email": "john@example.com",
    "profilePic": "https://cloudinary.com/...",
    "bio": "Software developer",
    "isPublic": true,
    "friends": ["65f456...", "65f789..."],
    "friendRequestsSent": [],
    "friendRequestsReceived": ["65fabc..."]
  }
}
```

**Errors:**
- `401` - No token provided
- `401` - Invalid token
- `401` - Token expired
- `500` - Server error

**Usage:**
- Frontend calls this on app load to restore authentication state
- Validates token on page refresh
- Returns full user object for AuthContext initialization

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/auth/check \
  -b cookies.txt
```

---

## Message Routes (`/api/messages`)

### 1. **GET** `/api/messages/:userId`
Fetch conversation history with a specific user (friend only).

**Access:** Protected (requires JWT token)

**URL Parameters:**
- `userId` - MongoDB ObjectId of the other user

**Headers:**
```
Cookie: token=<jwt-token>
```

**Response (200):**
```json
{
  "messages": [
    {
      "_id": "65f123...",
      "senderId": "65f456...",
      "receiverId": "65f789...",
      "text": "Hello! How are you?",
      "image": null,
      "createdAt": "2024-02-28T10:30:00.000Z"
    },
    {
      "_id": "65f124...",
      "senderId": "65f789...",
      "receiverId": "65f456...",
      "text": "I'm good! Thanks for asking.",
      "image": null,
      "createdAt": "2024-02-28T10:31:00.000Z"
    }
  ]
}
```

**Filtering:**
- Returns messages where `(senderId = currentUser && receiverId = userId)` OR `(senderId = userId && receiverId = currentUser)`
- Sorted by `createdAt` ascending (oldest first)

**Friend Restriction:**
- Only returns messages if users are friends
- Returns empty array if not friends

**Errors:**
- `401` - Not authenticated
- `400` - Invalid userId format
- `500` - Server error

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/messages/65f789abcdef123456 \
  -b cookies.txt
```

---

### 2. **POST** `/api/messages/send/:userId`
Send a text or image message to a friend.

**Access:** Protected (requires JWT token)

**URL Parameters:**
- `userId` - MongoDB ObjectId of the recipient

**Headers:**
```
Cookie: token=<jwt-token>
```

**Request Body:**
```json
{
  "text": "Hey! Check out this photo.",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response (201):**
```json
{
  "message": {
    "_id": "65f125...",
    "senderId": "65f456...",
    "receiverId": "65f789...",
    "text": "Hey! Check out this photo.",
    "image": "https://res.cloudinary.com/...",
    "createdAt": "2024-02-28T10:35:00.000Z"
  }
}
```

**Friend Restriction:**
- Only allows sending messages to users in `friends` array
- Returns `403` error if not friends

**Image Handling:**
- If `image` field provided, uploads to Cloudinary
- Returns Cloudinary URL in response
- Supports base64 encoded images

**Real-time Delivery:**
- Emits Socket.io `newMessage` event to recipient
- Updates recipient's UI instantly if online

**Errors:**
- `401` - Not authenticated
- `403` - Not friends with recipient
- `400` - Both text and image are empty
- `400` - Invalid userId format
- `500` - Server error or Cloudinary upload failure

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/messages/send/65f789abcdef123456 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "text": "Hello from cURL!",
    "image": null
  }'
```

---

## Friend Routes (`/api/friends`)

### 1. **POST** `/api/friends/send-request/:userId`
Send a friend request to another user.

**Access:** Protected (requires JWT token)

**URL Parameters:**
- `userId` - MongoDB ObjectId of the user to befriend

**Headers:**
```
Cookie: token=<jwt-token>
```

**Response (200):**
```json
{
  "message": "Friend request sent"
}
```

**Process:**
1. Add `userId` to current user's `friendRequestsSent` array
2. Add current user's ID to target user's `friendRequestsReceived` array
3. Emit Socket.io event to notify recipient (if online)

**Validation:**
- Cannot send request to yourself
- Cannot send duplicate request (check if already in `friendRequestsSent`)
- Cannot send if already friends
- Cannot send if recipient is private (unless they sent you a request first)

**Errors:**
- `401` - Not authenticated
- `400` - Cannot send request to yourself
- `400` - Friend request already sent
- `400` - Already friends
- `400` - User account is private
- `404` - User not found
- `500` - Server error

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/friends/send-request/65f789abcdef123456 \
  -b cookies.txt
```

---

### 2. **POST** `/api/friends/accept-request/:userId`
Accept a friend request from another user.

**Access:** Protected (requires JWT token)

**URL Parameters:**
- `userId` - MongoDB ObjectId of the user who sent the request

**Response (200):**
```json
{
  "message": "Friend request accepted"
}
```

**Process:**
1. Add `userId` to current user's `friends` array
2. Add current user's ID to requester's `friends` array
3. Remove `userId` from current user's `friendRequestsReceived`
4. Remove current user's ID from requester's `friendRequestsSent`
5. Emit Socket.io event to notify requester (if online)

**Errors:**
- `401` - Not authenticated
- `400` - No pending friend request from this user
- `404` - User not found
- `500` - Server error

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/friends/accept-request/65f789abcdef123456 \
  -b cookies.txt
```

---

### 3. **POST** `/api/friends/reject-request/:userId`
Reject a friend request from another user.

**Access:** Protected (requires JWT token)

**URL Parameters:**
- `userId` - MongoDB ObjectId of the user who sent the request

**Response (200):**
```json
{
  "message": "Friend request rejected"
}
```

**Process:**
1. Remove `userId` from current user's `friendRequestsReceived`
2. Remove current user's ID from requester's `friendRequestsSent`

**Errors:**
- `401` - Not authenticated
- `400` - No pending friend request from this user
- `404` - User not found
- `500` - Server error

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/friends/reject-request/65f789abcdef123456 \
  -b cookies.txt
```

---

### 4. **POST** `/api/friends/cancel-request/:userId`
Cancel a friend request you previously sent.

**Access:** Protected (requires JWT token)

**URL Parameters:**
- `userId` - MongoDB ObjectId of the user you sent the request to

**Response (200):**
```json
{
  "message": "Friend request cancelled"
}
```

**Process:**
1. Remove `userId` from current user's `friendRequestsSent`
2. Remove current user's ID from recipient's `friendRequestsReceived`

**Errors:**
- `401` - Not authenticated
- `400` - No pending friend request to this user
- `404` - User not found
- `500` - Server error

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/friends/cancel-request/65f789abcdef123456 \
  -b cookies.txt
```

---

### 5. **GET** `/api/friends/search`
Search for users by username (exact match) or full name (partial match for public accounts).

**Access:** Protected (requires JWT token)

**Query Parameters:**
- `query` - Search string (username or name)

**Headers:**
```
Cookie: token=<jwt-token>
```

**Request Example:**
```
GET /api/friends/search?query=john
```

**Response (200):**
```json
{
  "users": [
    {
      "_id": "65f789...",
      "fullName": "John Doe",
      "username": "johndoe123",
      "profilePic": "https://cloudinary.com/...",
      "isPublic": true,
      "isFriend": false,
      "requestSent": false,
      "requestReceived": false
    },
    {
      "_id": "65f790...",
      "fullName": "John Smith",
      "username": "johnsmith",
      "profilePic": "https://cloudinary.com/...",
      "isPublic": false,
      "isFriend": true,
      "requestSent": false,
      "requestReceived": false
    }
  ]
}
```

**Search Logic:**
1. **Username search:** Exact match, case-sensitive (e.g., `johndoe123` matches only exactly `johndoe123`)
2. **Name search:** Partial match, case-insensitive, only for public accounts (e.g., `john` matches `John Doe`, `Johnny`, etc.)
3. Private accounts only appear if username exactly matches

**Additional Fields:**
- `isFriend` - Boolean indicating if user is already a friend
- `requestSent` - Boolean indicating if current user sent a friend request
- `requestReceived` - Boolean indicating if user sent current user a friend request

**Errors:**
- `401` - Not authenticated
- `400` - Missing query parameter
- `500` - Server error

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/friends/search?query=john" \
  -b cookies.txt
```

---

### 6. **GET** `/api/friends/requests`
Fetch all incoming friend requests.

**Access:** Protected (requires JWT token)

**Headers:**
```
Cookie: token=<jwt-token>
```

**Response (200):**
```json
{
  "requests": [
    {
      "_id": "65f789...",
      "fullName": "Jane Smith",
      "username": "janesmith",
      "profilePic": "https://cloudinary.com/...",
      "bio": "Photographer and traveler"
    },
    {
      "_id": "65f790...",
      "fullName": "Bob Johnson",
      "username": "bobjohnson",
      "profilePic": "https://cloudinary.com/...",
      "bio": null
    }
  ]
}
```

**Process:**
- Populate `friendRequestsReceived` field with full user objects
- Returns array of users who sent friend requests

**Errors:**
- `401` - Not authenticated
- `500` - Server error

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/friends/requests \
  -b cookies.txt
```

---

### 7. **GET** `/api/friends/sent-requests`
Fetch all outgoing friend requests.

**Access:** Protected (requires JWT token)

**Headers:**
```
Cookie: token=<jwt-token>
```

**Response (200):**
```json
{
  "sentRequests": [
    {
      "_id": "65f791...",
      "fullName": "Alice Williams",
      "username": "alicew",
      "profilePic": "https://cloudinary.com/...",
      "isPublic": true
    }
  ]
}
```

**Process:**
- Populate `friendRequestsSent` field with full user objects
- Returns array of users current user sent requests to

**Errors:**
- `401` - Not authenticated
- `500` - Server error

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/friends/sent-requests \
  -b cookies.txt
```

---

## Middleware

### `auth.js` - JWT Token Verification
Protects routes by verifying JWT token from cookies.

**Location:** `server/middleware/auth.js`

**Usage:**
```javascript
router.get('/protected-route', protectRoute, controller)
```

**Process:**
1. Extract token from `req.cookies.token`
2. Verify token with `jwt.verify(token, JWT_SECRET)`
3. Decode user ID from token payload
4. Find user in database
5. Attach user object to `req.user`
6. Call `next()` to proceed

**Errors:**
- `401` - No token provided
- `401` - Invalid token
- `401` - Token expired
- `401` - User not found

---

## Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/heylo

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Resend Email API
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:5173

# Server Port
PORT=5000
```

---

## Error Response Format

All error responses follow this structure:

```json
{
"error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Resource created successfully
- `400` - Bad request (validation errors, missing fields)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (authenticated but not allowed)
- `404` - Resource not found
- `500` - Internal server error

---

## Testing Checklist

### Authentication Tests
- [ ] POST /api/auth/signup with valid data creates user
- [ ] POST /api/auth/signup with duplicate username returns 400
- [ ] POST /api/auth/signup with duplicate email returns 400
- [ ] POST /api/auth/login with valid credentials returns token
- [ ] POST /api/auth/login with wrong password returns 400
- [ ] POST /api/auth/check-username returns available=true for new username
- [ ] POST /api/auth/check-username returns available=false for taken username
- [ ] POST /api/auth/forgot-password sends email for valid email
- [ ] POST /api/auth/forgot-password returns 404 for non-existent email
- [ ] POST /api/auth/reset-password updates password with valid token
- [ ] POST /api/auth/reset-password returns 400 for expired token
- [ ] PUT /api/auth/update-profile updates user data
- [ ] PUT /api/auth/update-profile enforces 30-day username change restriction
- [ ] GET /api/auth/check returns user data with valid token

### Message Tests
- [ ] GET /api/messages/:userId returns conversation history
- [ ] GET /api/messages/:userId returns empty array for non-friends
- [ ] POST /api/messages/send/:userId sends message to friend
- [ ] POST /api/messages/send/:userId returns 403 for non-friend
- [ ] POST /api/messages/send/:userId uploads image to Cloudinary

### Friend Tests
- [ ] POST /api/friends/send-request/:userId sends friend request
- [ ] POST /api/friends/send-request/:userId returns 400 for duplicate request
- [ ] POST /api/friends/accept-request/:userId adds both users to friends arrays
- [ ] POST /api/friends/reject-request/:userId removes request without adding friend
- [ ] POST /api/friends/cancel-request/:userId removes sent request
- [ ] GET /api/friends/search returns users by username (exact match)
- [ ] GET /api/friends/search returns public users by name (partial match)
- [ ] GET /api/friends/search excludes private users from name search
- [ ] GET /api/friends/requests returns incoming friend requests
- [ ] GET /api/friends/sent-requests returns outgoing friend requests

---

## Summary of Work

### Authentication System
✅ JWT-based authentication with HTTP-only cookies  
✅ Two-step signup with username availability check  
✅ Forgot password flow with email verification  
✅ Password reset with token validation (1-hour expiry)  
✅ Profile update with username change restriction (30 days)  
✅ Public/Private account toggle  

### Messaging System
✅ Friend-only messaging restriction  
✅ Text and image message support  
✅ Cloudinary integration for image uploads  
✅ Real-time message delivery via Socket.io  
✅ Conversation history retrieval  

### Friend System
✅ Send/Accept/Reject/Cancel friend requests  
✅ User search (username exact + name partial for public accounts)  
✅ Friend request notifications  
✅ Privacy controls (public/private accounts)  

### Security Features
✅ Password hashing with bcrypt  
✅ JWT token authentication  
✅ Protected routes middleware  
✅ CORS configuration  
✅ Input validation and sanitization  
✅ Rate limiting (recommended for production)  

---

**Last Updated:** 2024  
**Express Version:** 5.1.0  
**Total Routes:** 19
