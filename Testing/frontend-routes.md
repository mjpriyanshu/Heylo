# Frontend Routes Documentation

## Overview
The frontend uses **React Router 7.7.0** for client-side routing with protected and public route configurations.

---

## Routes Table

| Path | Component | Access | Protection | Description |
|------|-----------|--------|------------|-------------|
| `/` | HomePage | Authenticated | Protected | Main chat interface with sidebar, conversation list, and message area |
| `/login` | LoginPage | Public | Redirect if logged in | Combined login and signup page with two-step signup process |
| `/profile` | ProfilePage | Authenticated | Protected | User profile management, settings, friend requests |
| `/forgot-password` | ForgotPasswordPage | Public | Redirect if logged in | Email input form to request password reset link |
| `/reset-password/:token` | ResetPasswordPage | Public | Redirect if logged in | Password reset form with token validation |

---

## Route Protection Logic

### Protected Routes (Require Authentication)
```jsx
// Pattern: authUser ? <Component/> : <Navigate to='/login' />
<Route path='/' element={authUser ? <HomePage/> : <Navigate to='/login' />}/>
<Route path='/profile' element={authUser ? <ProfilePage/> : <Navigate to='/login' />} />
```

### Public Routes (Redirect When Authenticated)
```jsx
// Pattern: !authUser ? <Component/> : <Navigate to='/' />
<Route path='/login' element={!authUser ? <LoginPage/> : <Navigate to='/' /> } />
<Route path='/forgot-password' element={!authUser ? <ForgotPasswordPage/> : <Navigate to='/' />} />
<Route path='/reset-password/:token' element={!authUser ? <ResetPasswordPage/> : <Navigate to='/' />} />
```

---

## User Flow Diagrams

### Authentication Flow
```
[User lands on app]
    |
    v
[Check authUser from AuthContext]
    |
    ├─> authUser = true  --> [HomePage]
    |
    └─> authUser = false --> [LoginPage]
                                |
                                ├─> Click "Sign up" --> [Two-step signup process]
                                |                         |
                                |                         ├─> Step 1: fullName, username, email, password
                                |                         |
                                |                         ├─> Check username availability API call
                                |                         |
                                |                         └─> Step 2: bio, terms & conditions checkbox
                                |
                                └─> Click "Login" --> [Login form]
                                                        |
                                                        └─> Navigate to HomePage on success
```

### Forgot Password Flow
```
[LoginPage]
    |
    └─> Click "Forgot Password?" link
            |
            v
    [ForgotPasswordPage]
            |
            ├─> Enter email address
            |
            ├─> Submit form (POST /api/auth/forgot-password)
            |
            ├─> Show success screen "Check Your Email"
            |
            └─> User clicks "Back to Login" --> [LoginPage]

[User receives email with reset link]
    |
    └─> Click reset link (https://yourapp.com/reset-password/{token})
            |
            v
    [ResetPasswordPage]
            |
            ├─> Enter new password + confirm password
            |
            ├─> Submit form (POST /api/auth/reset-password with token)
            |
            ├─> Password updated successfully
            |
            └─> Redirect to LoginPage with success toast
```

### Profile Management Flow
```
[HomePage]
    |
    └─> Click profile icon in navbar
            |
            v
    [ProfilePage]
            |
            ├─> View profile information
            |
            ├─> Edit profile (name, bio, profile picture)
            |
            ├─> Toggle public/private account
            |
            ├─> View/manage friend requests
            |
            ├─> Change username (30-day restriction check)
            |
            └─> Logout button
```

---

## Components by Route

### 1. **HomePage** (`/`)
**Main Components:**
- `Sidebar.jsx` - Left sidebar with user profile, search, and navigation
- `ChatContainer.jsx` - Main conversation area with messages
- `RightSidebar.jsx` - User info, media gallery, friend management

**Context Used:**
- `AuthContext` - For user authentication state and socket connection
- `ChatContext` - For chat state, messages, and selected user

**Key Features:**
- Real-time messaging with Socket.io
- Friend list display (only friends can chat)
- Online/offline status indicators
- Image sharing and viewing
- Message timestamp display

---

### 2. **LoginPage** (`/login`)
**State Management:**
- `currState` - Toggle between "Login" and "Sign up" modes
- Two-step signup:
  - **Step 1:** fullName, username, email, password (with username availability check)
  - **Step 2:** bio, terms & conditions checkbox

**Navigation:**
- Direct login after successful signup
- "Forgot Password?" link (visible only on Login screen)

**Validation:**
- Full Name: 3-50 characters
- Username: 3-20 characters, alphanumeric, case-sensitive unique
- Email: Valid email format
- Password: Minimum 6 characters
- Bio: Maximum 200 characters (optional)
- Terms: Must be accepted for signup

**API Calls:**
- `POST /api/auth/check-username` - Validate username availability before bio step
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate user

---

### 3. **ProfilePage** (`/profile`)
**Main Components:**
- Profile information display
- Edit profile modal
- Friend request manager
- Public/Private account toggle
- Username change functionality (30-day restriction)

**Context Used:**
- `AuthContext` - For updateProfile(), logout(), authUser state

**Key Features:**
- Profile picture upload (Cloudinary integration)
- Bio editing (max 200 characters)
- Username change (once per 30 days, case-sensitive availability check)
- Friend request notifications badge
- Logout functionality

**API Calls:**
- `PUT /api/auth/update-profile` - Update user profile data
- `POST /api/auth/check-username` - Check username availability before change
- `GET /api/friends/requests` - Fetch incoming friend requests
- `GET /api/friends/sent-requests` - Fetch outgoing friend requests

---

### 4. **ForgotPasswordPage** (`/forgot-password`)
**State Management:**
- `email` - User input for password reset
- `loading` - Submit button loading state
- `emailSent` - Success state toggle

**UI Screens:**
1. **Email Input Screen:**
   - Email input field
   - "Send Reset Link" button
   - "Back to Login" link

2. **Success Screen:**
   - Green checkmark icon
   - "Check Your Email" heading
   - Instructions message (1-hour expiry notice)
   - "Back to Login" button

**API Call:**
- `POST /api/auth/forgot-password` - Send password reset email via Resend

**Email Content:**
- Professional HTML template with gradient header
- Reset link button (valid for 1 hour)
- Security reminder message
- Branded with app name

---

### 5. **ResetPasswordPage** (`/reset-password/:token`)
**URL Parameter:**
- `:token` - JWT token extracted from URL using `useParams()` hook

**State Management:**
- `newPassword` - New password input
- `confirmPassword` - Password confirmation input
- `loading` - Submit button loading state

**Validation:**
- Password minimum 6 characters
- Passwords must match (client-side check)
- Token validation (server-side)

**API Call:**
- `POST /api/auth/reset-password` - Update password with token validation

**Error Handling:**
- Invalid token (expired or malformed)
- Token not found in database
- Password validation errors

**Success Behavior:**
- Show success toast notification
- Redirect to `/login` after 2-second delay
- User can now login with new password

---

## Navigation Utilities

### `navigate()` from `useNavigate()` Hook
Used throughout the app for programmatic navigation:
```jsx
import { useNavigate } from 'react-router-dom'
const navigate = useNavigate()

// Examples:
navigate('/forgot-password')  // Go to forgot password page
navigate('/login')            // Go to login page
navigate('/')                 // Go to homepage
```

### `<Navigate>` Component
Used in route definitions for redirect logic:
```jsx
<Route path='/login' element={!authUser ? <LoginPage/> : <Navigate to='/' />} />
```

---

## Context Providers

### AuthContext
**Location:** `client/context/AuthContext.jsx`

**Provides:**
- `authUser` - Current authenticated user object
- `login(credentials)` - Login function
- `logout()` - Logout function with socket disconnect
- `updateProfile(data)` - Update user profile
- `checkUsername(username)` - Check username availability
- `connectSocket()` - Initialize Socket.io connection

### ChatContext
**Location:** `client/context/ChatContext.jsx`

**Provides:**
- `selectedUser` - Currently selected chat user
- `setSelectedUser(user)` - Set active conversation
- `messages` - Array of messages in current conversation
- `sendMessage(messageData)` - Send new message
- `friends` - List of user's friends
- `onlineUsers` - Array of online user IDs

---

## Testing Checklist

### Route Access Tests
- [ ] Unauthenticated user accessing `/` redirects to `/login`
- [ ] Unauthenticated user accessing `/profile` redirects to `/login`
- [ ] Authenticated user accessing `/login` redirects to `/`
- [ ] Authenticated user accessing `/forgot-password` redirects to `/`
- [ ] Authenticated user accessing `/reset-password/:token` redirects to `/`

### Navigation Tests
- [ ] "Forgot Password?" link on login screen navigates correctly
- [ ] "Back to Login" button on ForgotPasswordPage navigates correctly
- [ ] Successful password reset redirects to login page
- [ ] Successful login redirects to homepage
- [ ] Logout navigates to login page

### Component Rendering Tests
- [ ] All routes render correct components
- [ ] Protected routes show loading state before redirecting
- [ ] 404 handling (undefined routes default to login redirect)

---

## Environment Dependencies

### Frontend URL Configuration
The reset password email contains a link to:
```
${process.env.FRONTEND_URL}/reset-password/${resetToken}
```

**Required Environment Variable (Backend):**
```env
FRONTEND_URL=https://your-frontend-domain.com
# Or for local development:
FRONTEND_URL=http://localhost:5173
```

---

## Mobile Responsiveness

All pages include responsive design with Tailwind CSS breakpoints:
- **sm:** 640px
- **md:** 768px
- **lg:** 1024px
- **xl:** 1280px

**Key Responsive Features:**
- Sidebar collapses on mobile (hamburger menu)
- Chat container adapts to screen width
- Profile page stacks vertically on mobile
- Image viewer modal fits screen on all devices
- Touch-friendly button sizes

---

## Summary of Work

### Authentication Routes
✅ Login/Signup page with two-step validation  
✅ Protected route configuration  
✅ Auto-redirect logic based on auth state  
✅ Forgot password flow (email → token → reset)  
✅ Password reset with token validation  

### Chat Routes
✅ Homepage with real-time messaging  
✅ Friend-only chat restriction  
✅ Online/offline status tracking  
✅ Socket.io integration with reconnection config  

### Profile Routes
✅ Profile management page  
✅ Public/Private account toggle  
✅ Username change (30-day restriction)  
✅ Friend request system  

### UI/UX Enhancements
✅ Mobile responsive design  
✅ Image viewer modal  
✅ Loading states and error handling  
✅ Toast notifications (react-hot-toast)  
✅ Smooth transitions and hover effects  

---

**Last Updated:** 2024  
**React Router Version:** 7.7.0  
**Total Routes:** 5
