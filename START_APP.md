# Starting HiveFive Application

## Quick Start

### Option 1: Start Both Servers (Recommended)

```bash
# From project root
npm run dev
```

This will start both frontend and backend simultaneously.

### Option 2: Start Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## First Time Setup

1. **Install Dependencies** (if not already done):
   ```bash
   npm run install:all
   ```

2. **Configure Environment Variables**:
   - Backend: `backend/.env` (already configured)
   - Frontend: Uses Firebase config from code

3. **Start the Servers**:
   ```bash
   npm run dev
   ```

## What You'll See

1. **Login Page**: 
   - Sign in with Google (Georgia Tech)
   - Firebase Authentication

2. **Profile Creation** (if new user):
   - Create your profile
   - Upload profile photo
   - Add your information

3. **Dashboard**:
   - View your hives
   - See upcoming events
   - Create new hives

4. **Hive Dashboard**:
   - View hive members
   - Create events
   - See event timeline
   - Upload media to gallery

## Troubleshooting

### Backend Won't Start

- Check MongoDB connection
- Verify Firebase Admin SDK file exists
- Check port 5000 is available
- Review backend logs for errors

### Frontend Won't Start

- Check port 3000 is available
- Verify all dependencies installed
- Check Firebase configuration
- Review browser console for errors

### MongoDB Connection Failed

- Verify MongoDB URI in `backend/.env`
- Check IP whitelist in MongoDB Atlas
- Verify database credentials

### Firebase Authentication Not Working

- Enable Google sign-in in Firebase Console
- Add `localhost` to authorized domains
- Verify Firebase config in code

## Development Tips

- Backend auto-reloads on file changes (using `--watch`)
- Frontend hot-reloads on file changes (Vite)
- Check browser console for frontend errors
- Check terminal for backend errors

