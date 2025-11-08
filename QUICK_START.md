# Quick Start Guide - Backend Server

## The Problem

You're seeing `ERR_CONNECTION_REFUSED` because the backend server is not running.

## Solution: Start the Backend Server

### Step 1: Open a Terminal

Open a new terminal window/tab.

### Step 2: Navigate to Backend Directory

```bash
cd /Users/anvitakallam/Documents/HiveFive/backend
```

### Step 3: Check Your .env File

Make sure you have a `.env` file with at least:

```env
# Required: MongoDB Connection
MONGODB_URI=your_mongodb_connection_string_here

# Required: Firebase Admin SDK
FIREBASE_ADMIN_SDK_PATH=./firebase-admin-sdk.json
# OR
# FIREBASE_ADMIN_SDK={"type":"service_account",...}

# Optional: Gemini API Key (for Buzz chatbot)
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port (optional, defaults to 5001)
PORT=5001
```

### Step 4: Start the Server

```bash
npm run dev
```

You should see:
```
Attempting to connect to MongoDB...
✅ MongoDB connected successfully: ...
Server is running on port 5001
```

### Step 5: Verify It's Running

In another terminal, test:
```bash
curl http://localhost:5001/api/health
```

You should get: `{"status":"ok","message":"HiveFive API is running"}`

## Common Issues

### Issue 1: MONGODB_URI Not Set

**Error:** `MONGODB_URI environment variable is not set`

**Fix:** Add your MongoDB connection string to `backend/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
```

### Issue 2: MongoDB Connection Failed

**Error:** `MongoServerSelectionError`

**Fix:**
1. Check your MongoDB Atlas Network Access settings
2. Add your IP address (or 0.0.0.0/0 for development)
3. Verify your connection string is correct

### Issue 3: Firebase Admin SDK Not Found

**Error:** `Firebase Admin SDK not found`

**Fix:**
1. Make sure `firebase-admin-sdk.json` exists in `backend/` directory
2. Or set `FIREBASE_ADMIN_SDK` environment variable with the JSON content

### Issue 4: Port Already in Use

**Error:** `Port 5001 is already in use`

**Fix:**
```bash
# Find and kill the process
lsof -ti:5001 | xargs kill -9

# Or change the port in .env
PORT=5002
```

## Running in Development

For development with auto-restart:
```bash
npm run dev
```

For production:
```bash
npm start
```

## Keep Server Running

The server needs to stay running while you use the frontend. Keep the terminal window open, or run it in the background using:

**Using screen:**
```bash
screen -S backend
npm run dev
# Press Ctrl+A then D to detach
```

**Using PM2:**
```bash
npm install -g pm2
pm2 start src/server.js --name hivefive-backend
pm2 logs hivefive-backend
```

## Next Steps

Once the server is running:
1. The frontend should be able to connect
2. You can test the API at http://localhost:5001/api/health
3. Check server logs for any errors

## Need Help?

Check the server logs for specific error messages. The server will tell you exactly what's missing or misconfigured.
