# HiveFive — AI-Driven Social Graph for Real-World Connection

HiveFive is a spatially-aware social networking app that helps students form intelligent micro-communities called hives — small, close-knit groups that automatically plan hangouts, track engagement, and evolve through an LLM-powered Hive Agent.

## Features

- **User Profiles**: Create personalized profiles with photos, major, hobbies, and residence hall
- **Hive Communities**: Join and create hives — small, close-knit groups
- **AI-Powered Event Planning**: Hive Agent analyzes availability and proposes optimal event times
- **Swipe-Based Event Acceptance**: Tinder-style interaction for event proposals
- **Google Calendar Integration**: Sync with Google Calendar for availability checking
- **Event Gallery**: Upload and share photos/videos from events with AI-powered sentiment analysis
- **Engagement Tracking**: Track swipe behavior, response times, and emotional engagement

## Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- Framer Motion
- React Router DOM
- Firebase Auth
- Zustand
- Axios + React Query
- react-tinder-card
- Google Maps JS SDK

### Backend
- Node.js + Express
- MongoDB Atlas
- Google Calendar API
- Vertex AI (Vision & Agent Engine)
- Firebase Admin SDK

## Getting Started

### Quick Start

**🚀 For a quick setup, see [QUICK_START.md](./QUICK_START.md)**

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- Firebase project (already created: `hivefive-4384c`)
- Google Cloud Project with Vertex AI enabled
- Google Calendar API credentials

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Set up Firebase:
   - **📖 Follow the detailed guide: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)**
   - Enable Google Authentication in Firebase Console
   - Set up Firebase Storage with security rules from `firebase-storage.rules`
   - Download Firebase Admin SDK and save as `backend/firebase-admin-sdk.json`

4. Set up environment variables:
   - Create `backend/.env` with your MongoDB URI and other credentials
   - Frontend Firebase config is already set up in the code!

5. Start development servers:
   ```bash
   npm run dev
   ```

### Environment Variables

#### Backend (.env)
- `MONGODB_URI`: MongoDB Atlas connection string
- `PORT`: Backend server port (default: 5000)
- `FIREBASE_ADMIN_SDK_PATH`: Path to Firebase Admin SDK JSON
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret
- `GOOGLE_REDIRECT_URI`: OAuth redirect URI
- `VERTEX_AI_PROJECT_ID`: Google Cloud Project ID
- `VERTEX_AI_LOCATION`: Vertex AI location (e.g., us-central1)
- `JWT_SECRET`: Secret for JWT tokens

#### Frontend (.env)
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase Auth domain
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID`: Firebase app ID
- `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:5000/api)
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key

## Project Structure

```
HiveFive/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── backend/           # Express backend API
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── services/
│   └── package.json
└── README.md
```

## Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get up and running in 5 minutes
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Complete Firebase configuration guide
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Codebase architecture overview

## License

ISC

