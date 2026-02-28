# Heylo - Frontend (Client)

This is the frontend application for Heylo, a real-time chat application built with React and Vite.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ChatContainer.jsx
│   ├── RightSidebar.jsx
│   └── Sidebar.jsx
├── pages/             # Page components
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   └── ProfilePage.jsx
├── assets/            # Static assets
├── lib/               # Utility functions
├── App.jsx            # Main app component
└── main.jsx           # Entry point

context/               # React contexts (outside src)
├── AuthContext.jsx    # Authentication state
└── ChatContext.jsx    # Chat state

public/                # Public assets
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_BACKEND_URL=http://localhost:3000
```

For production:
```env
VITE_BACKEND_URL=https://your-backend-domain.vercel.app
```

## 🌐 Deployment

This app is configured for deployment on Vercel with the `vercel.json` configuration for SPA routing.

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Configure environment variables in Vercel dashboard

## 📱 Features

- **Real-time messaging** with Socket.io
- **User authentication** with JWT
- **Image sharing** with drag & drop
- **Online status** indicators
- **Responsive design** for all devices
- **Modern UI** with Tailwind CSS

---

For complete setup instructions, see the main [README.md](../README.md) in the project root.