# HiveFive Project Structure

## Overview

HiveFive is a full-stack application with a React frontend and Node.js/Express backend. The project follows a modular structure with clear separation of concerns.

## Directory Structure

```
HiveFive/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   ├── CalendarSync.jsx
│   │   │   ├── CreateEventModal.jsx
│   │   │   ├── EventSwipe.jsx
│   │   │   ├── Gallery.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── config/          # Configuration files
│   │   │   ├── api.js       # Axios instance with auth
│   │   │   └── firebase.js  # Firebase initialization
│   │   ├── pages/           # Page components
│   │   │   ├── CreateHive.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── HiveDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── UserCreationPage.jsx
│   │   ├── store/           # State management (Zustand)
│   │   │   └── authStore.js
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                  # Express backend API
│   ├── src/
│   │   ├── config/          # Configuration
│   │   │   └── database.js  # MongoDB connection
│   │   ├── controllers/     # Route controllers (future)
│   │   ├── middleware/      # Express middleware
│   │   │   └── auth.js      # Firebase Auth middleware
│   │   ├── models/          # MongoDB models
│   │   │   ├── Event.js
│   │   │   ├── Hive.js
│   │   │   ├── InteractionLog.js
│   │   │   ├── Media.js
│   │   │   └── User.js
│   │   ├── routes/          # API routes
│   │   │   ├── auth.js
│   │   │   ├── calendar.js
│   │   │   ├── events.js
│   │   │   ├── hives.js
│   │   │   ├── media.js
│   │   │   └── users.js
│   │   ├── services/        # Business logic services
│   │   │   ├── calendarService.js
│   │   │   ├── hiveAgent.js
│   │   │   └── vertexAI.js
│   │   └── server.js        # Express server entry point
│   ├── package.json
│   └── .env.example
│
├── package.json              # Root package.json
├── README.md
├── SETUP.md
└── .gitignore
```

## Key Components

### Frontend Components

#### Pages
- **Login.jsx**: Authentication page with Google Sign-In
- **UserCreationPage.jsx**: Profile creation form for new users
- **Dashboard.jsx**: Main dashboard showing user's hives and events
- **HiveDashboard.jsx**: Individual hive view with members, events, and gallery
- **CreateHive.jsx**: Form to create a new hive

#### Components
- **EventSwipe.jsx**: Tinder-style swipe cards for event acceptance
- **Gallery.jsx**: Media gallery with upload and review functionality
- **CreateEventModal.jsx**: Modal for creating new hive events
- **CalendarSync.jsx**: Google Calendar integration component
- **ProtectedRoute.jsx**: Route guard for authenticated routes

### Backend Models

#### User Model
- Profile information (name, major, hobbies, etc.)
- Hive memberships
- Google Calendar refresh token
- Preferences and settings

#### Hive Model
- Hive name and members
- Activity frequency
- Hive Agent ID
- Default location settings

#### Event Model
- Event details (title, description, location)
- Proposed times from Hive Agent
- Acceptance/decline tracking
- Swipe logs for engagement analysis
- Sentiment scores

#### Media Model
- Event media (photos/videos)
- Facial sentiment analysis results
- User reviews and ratings
- Upload metadata

#### InteractionLog Model
- Swipe interactions
- Response times
- GPS data
- Emotion data

### Backend Services

#### Hive Agent Service
- Analyzes member availability
- Generates optimal event proposals
- Considers activity frequency and preferences

#### Calendar Service
- Google Calendar OAuth integration
- Availability checking
- Event creation

#### Vertex AI Service
- Facial expression analysis
- Sentiment detection from media
- Future: Text embeddings for vector search

## Data Flow

### User Registration Flow
1. User signs in with Google (Firebase Auth)
2. Backend checks if user exists
3. If not, redirect to UserCreationPage
4. User creates profile
5. Profile saved to MongoDB
6. User redirected to Dashboard

### Event Creation Flow
1. User creates event in HiveDashboard
2. Backend receives event request
3. Hive Agent analyzes member availability
4. Event proposals generated
5. Event saved with proposed times
6. Members receive swipe cards

### Swipe Flow
1. Member swipes on event card
2. Swipe direction and response time logged
3. InteractionLog created
4. Event acceptance/decline updated
5. If all members respond, event status updated

### Media Upload Flow
1. User uploads photo/video to Firebase Storage
2. Backend receives media metadata
3. Vertex AI analyzes facial expressions
4. Sentiment scores calculated
5. Media saved to MongoDB with analysis
6. Gallery updated

## API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user profile
- `PUT /api/users/:id` - Update user profile

### Hives
- `GET /api/hives` - Get user's hives
- `GET /api/hives/:id` - Get hive by ID
- `POST /api/hives` - Create hive
- `PUT /api/hives/:id` - Update hive
- `POST /api/hives/:id/members` - Add member to hive

### Events
- `GET /api/events/hive/:hiveId` - Get events for hive
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event
- `POST /api/events/:id/swipe` - Swipe on event
- `PUT /api/events/:id` - Update event

### Media
- `GET /api/media/event/:eventId` - Get media for event
- `GET /api/media/hive/:hiveId` - Get media for hive
- `POST /api/media` - Upload media
- `POST /api/media/:id/reviews` - Add review to media

### Calendar
- `GET /api/calendar/auth-url` - Get Google Calendar OAuth URL
- `GET /api/calendar/callback` - OAuth callback
- `GET /api/calendar/availability` - Get user availability

## Environment Variables

See `SETUP.md` for detailed environment variable configuration.

## Technology Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- Firebase Auth & Storage
- Zustand
- React Query
- Axios
- react-tinder-card
- lucide-react (icons)

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- Firebase Admin SDK
- Google APIs (Calendar, Vision)
- Vertex AI
- JWT

## Future Enhancements

1. **Vertex AI Agent Engine Integration**: Full LLM-powered Hive Agents
2. **Real-time Updates**: WebSocket integration for live updates
3. **GPS Tracking**: Proximity-based features
4. **Emotion Detection**: Camera-based emotion analysis during swipes
5. **Push Notifications**: Real-time event notifications
6. **Analytics Dashboard**: Hive engagement analytics
7. **Mobile App**: React Native version
8. **Advanced Search**: Vector search for finding hives
9. **Recommendations**: AI-powered hive recommendations
10. **Social Features**: Comments, reactions, shares

