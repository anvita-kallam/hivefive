# HiveFive Setup Guide

This guide will help you set up the HiveFive application for local development.

## Prerequisites

1. **Node.js** (v18 or higher) and npm
2. **MongoDB Atlas** account (free tier works)
3. **Firebase** project
4. **Google Cloud Project** with:
   - Vertex AI enabled
   - Google Calendar API enabled
   - Google Maps API enabled
5. **Google OAuth 2.0** credentials

## Step 1: Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install:all
```

## Step 2: Set Up Firebase

**📖 Detailed Firebase setup instructions are in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)**

Quick steps:

1. Go to [Firebase Console](https://console.firebase.google.com/project/hivefive-4384c)
2. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Google sign-in
   - Add authorized domain: `localhost`
3. Enable Storage:
   - Go to Storage
   - Click "Get Started"
   - Copy the Storage security rules from `firebase-storage.rules` file
   - Paste and publish the rules
4. Download Firebase Admin SDK:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `firebase-admin-sdk.json` in the `backend/` directory
   - **IMPORTANT**: This file is already in `.gitignore` - never commit it!

**For detailed Firebase setup, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)**

## Step 3: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

## Step 4: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable APIs:
   - Vertex AI API
   - Google Calendar API
   - Google Maps JavaScript API
4. Create OAuth 2.0 credentials:
   - Go to APIs & Services > Credentials
   - Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:5000/api/calendar/callback`
   - Save the Client ID and Client Secret
5. Set up service account for Vertex AI:
   - Go to IAM & Admin > Service Accounts
   - Create a new service account
   - Grant roles: Vertex AI User, Storage Object Viewer
   - Create a key (JSON) and download it
   - Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to this file

## Step 5: Configure Environment Variables

### Backend (.env)

Create `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hivefive?retryWrites=true&w=majority

# Firebase Admin
FIREBASE_ADMIN_SDK_PATH=./path/to/firebase-admin-sdk.json
# OR use Google Application Default Credentials
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account.json

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/callback

# Vertex AI
VERTEX_AI_PROJECT_ID=your-gcp-project-id
VERTEX_AI_LOCATION=us-central1

# JWT (generate a random string)
JWT_SECRET=your-random-secret-key-here

# API Base URL
API_BASE_URL=http://localhost:5000/api
```

### Frontend (.env)

Create `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## Step 6: Run the Application

```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Step 7: First Login

1. Open http://localhost:3000
2. Click "Sign in with Georgia Tech"
3. Sign in with your Google account (must be @gatech.edu for production)
4. Complete your profile creation
5. Create your first hive!

## Troubleshooting

### Firebase Admin Not Initializing

- Make sure `FIREBASE_ADMIN_SDK_PATH` points to the correct JSON file
- Check that the JSON file is valid
- Alternatively, use `GOOGLE_APPLICATION_CREDENTIALS` with a service account

### MongoDB Connection Issues

- Verify your connection string is correct
- Check that your IP is whitelisted in MongoDB Atlas
- Ensure the database user has proper permissions

### Google Calendar OAuth Issues

- Verify redirect URI matches exactly: `http://localhost:5000/api/calendar/callback`
- Check that OAuth consent screen is configured
- Ensure Google Calendar API is enabled

### Vertex AI Issues

- Verify Vertex AI API is enabled in Google Cloud
- Check service account has proper permissions
- Ensure `VERTEX_AI_PROJECT_ID` and `VERTEX_AI_LOCATION` are correct

## Next Steps

- Customize the Hive Agent logic in `backend/src/services/hiveAgent.js`
- Integrate emotion detection from camera (requires additional permissions)
- Add GPS tracking for proximity-based features
- Deploy to production (Heroku, Vercel, etc.)

## Production Deployment

For production deployment:

1. Update environment variables for production URLs
2. Configure Firebase for production domain
3. Update OAuth redirect URIs
4. Set up proper CORS policies
5. Use environment-specific MongoDB clusters
6. Enable Firebase App Check for security
7. Set up monitoring and logging

## Support

For issues or questions, please check the GitHub repository or contact the development team.

