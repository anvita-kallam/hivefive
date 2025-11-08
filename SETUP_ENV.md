# Environment Setup Guide

## Quick Setup Steps

### Step 1: Update MongoDB Connection String

Your MongoDB connection string is:
```
mongodb+srv://kranvita007_db_user:<db_password>@hivefive.anukffg.mongodb.net/?appName=HiveFive
```

**Action Required:** Replace `<db_password>` with your actual MongoDB password.

### Step 2: Update `.env` File

Edit `backend/.env` and add/update these variables:

```env
# MongoDB Connection (REQUIRED)
# Replace <db_password> with your actual password
MONGODB_URI=mongodb+srv://kranvita007_db_user:YOUR_ACTUAL_PASSWORD@hivefive.anukffg.mongodb.net/hivefive?retryWrites=true&w=majority&appName=HiveFive

# Firebase Admin SDK (REQUIRED)
# Option 1: If you have firebase-admin-sdk.json file in backend directory:
FIREBASE_ADMIN_SDK_PATH=./firebase-admin-sdk.json

# Option 2: Or use environment variable (paste your Firebase Admin SDK JSON):
# FIREBASE_ADMIN_SDK={"type":"service_account","project_id":"...",...}

# Server Port
PORT=5001

# Node Environment
NODE_ENV=development
```

### Step 3: Get Your MongoDB Password

1. Go to MongoDB Atlas
2. Navigate to Database Access
3. Find user `kranvita007_db_user`
4. Click "Edit" to view/reset the password
5. Copy the password and replace `<db_password>` in the connection string

### Step 4: Configure Firebase Admin SDK

**Option A: Using a JSON file (Recommended for local development)**

1. Download your Firebase Admin SDK JSON file from Firebase Console
2. Save it as `backend/firebase-admin-sdk.json`
3. Make sure it's in `.gitignore` (it already is)
4. Set in `.env`: `FIREBASE_ADMIN_SDK_PATH=./firebase-admin-sdk.json`

**Option B: Using environment variable (For cloud deployment)**

1. Copy the entire JSON content from your Firebase Admin SDK file
2. Add it to `.env` as:
   ```env
   FIREBASE_ADMIN_SDK='{"type":"service_account","project_id":"...",...}'
   ```
   (Make sure to escape quotes properly or use single quotes around the JSON)

### Step 5: Test the Configuration

```bash
cd backend
node -e "require('dotenv').config(); console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET ✅' : 'NOT SET ❌'); console.log('FIREBASE:', process.env.FIREBASE_ADMIN_SDK_PATH || process.env.FIREBASE_ADMIN_SDK ? 'SET ✅' : 'NOT SET ❌');"
```

### Step 6: Start the Server

```bash
cd backend
npm run dev
```

You should see:
```
Attempting to connect to MongoDB...
✅ MongoDB connected successfully: ...
Server is running on port 5001
```

## Troubleshooting

### MongoDB Connection Fails

1. **Check your password**: Make sure you replaced `<db_password>` with the actual password
2. **Check MongoDB Atlas Network Access**: 
   - Go to Network Access in MongoDB Atlas
   - Add IP Address: `0.0.0.0/0` (Allow from anywhere) for development
   - Or add your specific IP address
3. **Verify the connection string format**: Should be `mongodb+srv://username:password@cluster.mongodb.net/database?options`

### Firebase Admin SDK Not Found

1. **Check file path**: Make sure `firebase-admin-sdk.json` is in the `backend/` directory
2. **Check file name**: Should be exactly `firebase-admin-sdk.json`
3. **Check permissions**: Make sure the file is readable
4. **Alternative**: Use `FIREBASE_ADMIN_SDK` environment variable instead

### Server Won't Start

1. **Check all environment variables are set**: Run the test command above
2. **Check MongoDB connection**: Make sure MongoDB Atlas is accessible
3. **Check Firebase credentials**: Verify the Firebase Admin SDK is configured correctly
4. **Check port**: Make sure port 5001 is not already in use

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to git (it's already in `.gitignore`)
- Never commit `firebase-admin-sdk.json` to git (it's already in `.gitignore`)
- For production, use environment variables on your hosting platform
- Keep your MongoDB password secure

## Next Steps

Once the server starts successfully:
1. The frontend should be able to connect
2. Test the API at: http://localhost:5001/api/health
3. Try logging in and using the app

