# HiveFive Tech Stack

A comprehensive overview of all technologies, frameworks, libraries, and services used in the HiveFive application.

## 🎯 Architecture Overview

HiveFive follows a **modern full-stack architecture** with:
- **Frontend**: React.js SPA (Single Page Application) with client-side routing
- **Backend**: Node.js REST API with Express.js
- **Database**: MongoDB (NoSQL document database)
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage
- **AI/ML**: Google Vertex AI & Gemini API
- **Maps**: Google Maps JavaScript API
- **Deployment**: Vercel (Frontend) + Railway (Backend)

---

## 🎨 Frontend Tech Stack

### Core Framework
- **React 18.2.0** - Modern UI library with hooks and functional components
- **Vite 5.0.8** - Next-generation frontend build tool (faster than Webpack)
  - Fast HMR (Hot Module Replacement)
  - Optimized production builds
  - ES modules support

### Routing & Navigation
- **React Router DOM 6.20.1** - Client-side routing
  - Protected routes
  - Dynamic route parameters
  - Programmatic navigation

### State Management
- **Zustand 4.4.7** - Lightweight state management
  - Global auth state
  - User session management
- **TanStack React Query 5.14.2** - Server state management
  - API data fetching
  - Caching & synchronization
  - Optimistic updates
  - Automatic refetching

### Styling & UI
- **Tailwind CSS 3.3.6** - Utility-first CSS framework
  - Responsive design
  - Custom color palette (honey-themed)
  - Custom animations
- **Framer Motion 10.16.16** - Animation library
  - Smooth transitions
  - Gesture animations
  - Layout animations
- **Lucide React 0.294.0** - Icon library
  - Consistent icon system
  - Tree-shakeable icons

### HTTP Client
- **Axios 1.6.2** - HTTP client library
  - Request/response interceptors
  - Automatic token injection
  - Error handling
  - Request/response transformation

### Authentication & Storage
- **Firebase 10.14.1** - Google's backend platform
  - **Firebase Authentication**: Google Sign-In
  - **Firebase Storage**: Media file storage (photos, videos)
  - Real-time authentication state

### Maps & Location
- **@react-google-maps/api 2.19.3** - React wrapper for Google Maps
  - Interactive maps
  - Location picker
  - Geocoding
  - Place autocomplete

### Date & Time
- **date-fns 2.30.0** - Date utility library
  - Date formatting
  - Date manipulation
  - Relative time (e.g., "2 hours ago")

### AI & Face Recognition
- **face-api.js 0.22.2** - Face detection and emotion recognition
  - Real-time face detection
  - Emotion analysis (happy, sad, angry, etc.)
  - Sentiment scoring
  - Used in reaction recording

### Charts & Data Visualization
- **Recharts 3.3.0** - Composable charting library
  - Bar charts
  - Pie charts
  - Sentiment visualization
  - Emotion distribution graphs

### UI Components
- **react-tinder-card 1.6.1** - Tinder-style swipe cards (legacy, replaced)
- **@react-spring/web 9.7.5** - Spring physics animations (for smooth interactions)

### Development Tools
- **TypeScript types** - Type definitions for React
- **PostCSS 8.4.32** - CSS processing
- **Autoprefixer 10.4.16** - Automatic vendor prefixes

---

## 🚀 Backend Tech Stack

### Core Framework
- **Node.js 18+** - JavaScript runtime
- **Express.js 4.18.2** - Web application framework
  - RESTful API endpoints
  - Middleware support
  - Route handling
  - Error handling

### Database
- **MongoDB Atlas** - Cloud-hosted MongoDB
- **Mongoose 8.0.3** - MongoDB object modeling
  - Schema definition
  - Data validation
  - Query building
  - Relationships (references)
  - Middleware (pre/post hooks)

### Authentication & Security
- **Firebase Admin SDK 12.0.0** - Server-side Firebase
  - Token verification
  - User management
  - Secure authentication
- **JWT (jsonwebtoken) 9.0.2** - JSON Web Tokens (for custom auth if needed)
- **CORS 2.8.5** - Cross-Origin Resource Sharing
  - Secure API access
  - Origin whitelisting

### AI & Machine Learning
- **@google-cloud/vertexai 1.10.0** - Vertex AI SDK
  - Gemini 2.0 Flash model
  - LLM-powered Hive Agent
  - Event planning suggestions
  - Chatbot (Buzz) responses
- **@google/generative-ai 0.24.1** - Gemini API client
  - Alternative AI client
  - Fallback for Vertex AI
  - Chat completion
- **@google-cloud/vision 4.0.0** - Vision API
  - Image analysis
  - Sentiment detection from media
  - Face detection (backup to face-api.js)

### Google Services
- **googleapis 128.0.0** - Google APIs client
  - Google Calendar integration
  - OAuth 2.0 flow
  - Calendar event management
  - Availability checking

### File Upload
- **Multer 1.4.5-lts.1** - File upload middleware
  - Multipart/form-data handling
  - File validation
  - Temporary file storage

### Environment & Configuration
- **dotenv 16.3.1** - Environment variable management
  - Secure credential storage
  - Configuration management

### Development Tools
- **Nodemon 3.0.2** - Development server with auto-restart

---

## 🗄️ Database Schema

### Models (MongoDB Collections)

1. **User**
   - Profile information
   - Hive memberships
   - Preferences
   - Google Calendar tokens

2. **Hive**
   - Group information
   - Member references
   - Activity frequency
   - Default location (GeoJSON)
   - Settings

3. **Event**
   - Event details
   - Proposed times
   - Accepted/declined members
   - Location (GeoJSON)
   - Swipe logs
   - Sentiment scores

4. **Media**
   - File URLs (Firebase Storage)
   - Facial sentiment analysis
   - Reaction videos/photos
   - Event associations
   - User reviews

5. **Chat**
   - Hive chat messages
   - Buzz (AI) messages
   - Reactions & emojis
   - Mentions
   - Event associations

6. **UserCalendarEvent**
   - User's personal calendar events
   - Start/end times
   - Location
   - Color coding
   - All-day events

7. **InteractionLog**
   - Swipe interactions
   - Response times
   - GPS data
   - Emotion data

---

## ☁️ Cloud Services & APIs

### Firebase (Google)
- **Authentication**: Google Sign-In, email/password
- **Storage**: Media files (images, videos)
- **Security Rules**: Firestore & Storage rules

### Google Cloud Platform
- **Vertex AI**: LLM-powered Hive Agent, Buzz chatbot
- **Gemini API**: Alternative LLM endpoint
- **Vision API**: Image sentiment analysis
- **Google Maps API**: Location services, geocoding
- **Google Calendar API**: Calendar integration

### MongoDB Atlas
- **Database Hosting**: Cloud-hosted MongoDB
- **Automatic Backups**: Data persistence
- **Scalability**: Auto-scaling clusters

---

## 🚢 Deployment

### Frontend Deployment
- **Platform**: Vercel
- **Build Tool**: Vite
- **Static Hosting**: CDN distribution
- **Configuration**: `vercel.json`
  - Client-side routing support
  - Environment variables
  - Build settings

### Backend Deployment
- **Platform**: Railway
- **Runtime**: Node.js
- **Process Management**: Railway's process manager
- **Environment Variables**: Railway dashboard
- **Database**: MongoDB Atlas (external)

### CI/CD
- **Git**: Version control (GitHub)
- **Automatic Deployment**: Vercel & Railway auto-deploy on push
- **Environment Management**: Separate dev/prod environments

---

## 📦 Key Features & Technologies

### 1. Real-Time Face Recognition
- **face-api.js**: Client-side face detection
- **MediaRecorder API**: Video recording
- **Canvas API**: Image processing
- **WebRTC**: Camera access

### 2. AI-Powered Features
- **Hive Agent**: Event planning AI
- **Buzz Chatbot**: Conversational AI assistant
- **Sentiment Analysis**: Emotion detection from media
- **Calendar Awareness**: AI considers member availability

### 3. Interactive UI Components
- **Swipe Cards**: Event invitation cards
- **Full-Screen Modals**: Event invite overlays
- **Reaction Recorder**: Video recording with sentiment
- **Sentiment Graphs**: Data visualization with Recharts
- **Calendar Views**: Simple calendar with event management

### 4. Maps & Location
- **Google Maps JavaScript API**: Interactive maps
- **Geocoding**: Address to coordinates
- **Place Autocomplete**: Location search
- **GeoJSON**: Spatial data storage

### 5. Data Visualization
- **Recharts**: Emotion distribution charts
- **Bar Charts**: Sentiment over time
- **Pie Charts**: Emotion breakdown
- **Custom Styling**: Honey-themed colors

---

## 🔧 Development Workflow

### Frontend Development
```bash
cd frontend
npm install
npm run dev  # Starts Vite dev server on port 3000
```

### Backend Development
```bash
cd backend
npm install
npm run dev  # Starts Express server on port 5001 with nodemon
```

### Build Process
- **Frontend**: `vite build` → Optimized production bundle
- **Backend**: `node src/server.js` → Production server

---

## 🔐 Security

### Authentication Flow
1. User signs in with Google (Firebase Auth)
2. Frontend receives Firebase ID token
3. Token sent to backend in Authorization header
4. Backend verifies token with Firebase Admin SDK
5. Backend returns user data

### Data Security
- **Environment Variables**: Sensitive data in `.env` files
- **CORS**: Restricted origin access
- **Firebase Security Rules**: Storage & Firestore rules
- **MongoDB**: Connection string encryption
- **HTTPS**: SSL/TLS encryption in production

---

## 📊 Performance Optimizations

### Frontend
- **Code Splitting**: Lazy loading routes
- **Tree Shaking**: Unused code elimination
- **Image Optimization**: Firebase Storage CDN
- **Caching**: React Query caching
- **Memoization**: React hooks optimization

### Backend
- **Database Indexing**: MongoDB indexes
- **Query Optimization**: Mongoose query optimization
- **Connection Pooling**: MongoDB connection pooling
- **Async/Await**: Non-blocking I/O
- **Error Handling**: Comprehensive error handling

---

## 🎨 Design System

### Color Palette (Honey Theme)
- **Primary Colors**: Honey golds, ambers, browns
- **Background**: Warm yellow gradients
- **Glass Morphism**: Frosted glass effects
- **Custom Animations**: Honey drip, buzzing effects

### Typography
- **Font System**: System fonts (San Francisco, Segoe UI, etc.)
- **Hierarchy**: Clear heading structure
- **Readability**: High contrast text

### Components
- **Honey Cards**: Glass-morphism cards
- **Hexagon Buttons**: Custom shape buttons
- **Flying Bees**: Animated bee decorations
- **Sentiment Graphs**: Data visualization components

---

## 📱 Browser Support

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile**: Responsive design for iOS & Android

---

## 🔮 Future Technologies (Potential)

- **WebSockets**: Real-time chat updates
- **Service Workers**: Offline support
- **PWA**: Progressive Web App features
- **GraphQL**: Alternative to REST API
- **Redis**: Caching layer
- **Docker**: Containerization
- **Kubernetes**: Container orchestration

---

## 📚 Additional Resources

- **React Documentation**: https://react.dev
- **Vite Documentation**: https://vitejs.dev
- **Express.js Documentation**: https://expressjs.com
- **MongoDB Documentation**: https://docs.mongodb.com
- **Firebase Documentation**: https://firebase.google.com/docs
- **Vertex AI Documentation**: https://cloud.google.com/vertex-ai
- **Google Maps API**: https://developers.google.com/maps

---

## 🎓 Learning Resources

### For Frontend Developers
- React Hooks
- React Router
- Zustand state management
- TanStack React Query
- Tailwind CSS
- Framer Motion animations

### For Backend Developers
- Express.js middleware
- MongoDB/Mongoose
- Firebase Admin SDK
- Google Cloud APIs
- RESTful API design
- Authentication & authorization

### For Full-Stack Developers
- JWT tokens
- CORS configuration
- Environment variables
- Deployment strategies
- Error handling
- API design patterns

---

## 🏗️ Architecture Patterns

### Frontend Patterns
- **Component-Based Architecture**: Reusable React components
- **Container/Presentational Pattern**: Separation of concerns
- **Custom Hooks**: Reusable logic
- **Context API**: Shared state (when needed)
- **Higher-Order Components**: Auth protection

### Backend Patterns
- **RESTful API**: Standard HTTP methods
- **MVC Pattern**: Models, Routes (Controllers), Services
- **Middleware Pattern**: Auth, error handling, CORS
- **Service Layer**: Business logic separation
- **Repository Pattern**: Database abstraction (Mongoose)

---

## 📝 Code Quality

### Linting & Formatting
- **ESLint**: JavaScript linting (implicit)
- **Prettier**: Code formatting (implicit)
- **TypeScript Types**: Type definitions for better DX

### Best Practices
- **ES6+ Syntax**: Modern JavaScript
- **Async/Await**: Promise handling
- **Error Boundaries**: React error handling
- **Input Validation**: Both client and server-side
- **Security Headers**: CORS, authentication
- **Environment Variables**: Secure configuration

---

This tech stack provides a modern, scalable, and maintainable foundation for the HiveFive application, enabling real-time interactions, AI-powered features, and seamless user experiences.

