# HiveFive Quick Start Guide

Get HiveFive up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Firebase project created (already done: `hivefive-4384c`)
- MongoDB Atlas account (free tier works)

## Quick Setup

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Set Up Firebase

Follow the instructions in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) to:
- Enable Google Authentication
- Set up Firebase Storage with security rules
- Download Firebase Admin SDK

**Quick version:**
1. Go to [Firebase Console](https://console.firebase.google.com/project/hivefive-4384c/authentication/users)
2. Enable Google sign-in in Authentication
3. Enable Storage and copy rules from `firebase-storage.rules`
4. Download Admin SDK from Project Settings > Service Accounts
5. Save it as `backend/firebase-admin-sdk.json`

### 3. Set Up MongoDB

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist your IP (or use `0.0.0.0/0` for development)
4. Get your connection string

### 4. Configure Environment Variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your-mongodb-connection-string
FIREBASE_ADMIN_SDK_PATH=./firebase-admin-sdk.json
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/callback
VERTEX_AI_PROJECT_ID=your-gcp-project-id
VERTEX_AI_LOCATION=us-central1
JWT_SECRET=your-random-secret-key
```

The frontend Firebase config is already set up in the code!

### 5. Start the Application

```bash
npm run dev
```

This starts both frontend (port 3000) and backend (port 5000).

### 6. Test the App

1. Open http://localhost:3000
2. Click "Sign in with Georgia Tech"
3. Sign in with your Google account
4. Create your profile
5. Create your first hive!

## What's Next?

- Read [SETUP.md](./SETUP.md) for detailed setup instructions
- Read [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for Firebase configuration
- Read [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) to understand the codebase

## Troubleshooting

### Firebase Authentication Not Working
- Make sure Google sign-in is enabled in Firebase Console
- Check that `localhost` is in authorized domains
- Verify Firebase config is correct

### MongoDB Connection Failed
- Check your connection string
- Verify your IP is whitelisted
- Check database user credentials

### Backend Won't Start
- Check that `backend/.env` exists and has all required variables
- Verify Firebase Admin SDK file exists and path is correct
- Check that port 5000 is available

### Frontend Won't Start
- Check that port 3000 is available
- Verify all dependencies are installed: `cd frontend && npm install`

## Need Help?

- Check the detailed guides in the repository
- Review Firebase Console for error logs
- Check browser console for frontend errors
- Check terminal for backend errors

