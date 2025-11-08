# ⚠️ ACTION REQUIRED: Update Your MongoDB Password

## Current Status

✅ Firebase Admin SDK file found: `backend/firebase-admin-sdk.json`
✅ Firebase Admin SDK path configured in `.env`
❌ MongoDB password needs to be set in `.env`

## What You Need to Do

### Step 1: Get Your MongoDB Password

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click on **Database Access** in the left sidebar
3. Find the user: `kranvita007_db_user`
4. Click **Edit** on that user
5. Either:
   - **View the current password** (if you remember it), OR
   - **Reset the password** by clicking "Edit Password" → "Reset Password"
6. **Copy the password**

### Step 2: Update `.env` File

1. Open `backend/.env` in your editor
2. Find this line:
   ```env
   MONGODB_URI=mongodb+srv://kranvita007_db_user:<db_password>@hivefive.anukffg.mongodb.net/hivefive?retryWrites=true&w=majority&appName=HiveFive
   ```
3. Replace `<db_password>` with your actual MongoDB password

   **Example:**
   ```env
   MONGODB_URI=mongodb+srv://kranvita007_db_user:MyPassword123@hivefive.anukffg.mongodb.net/hivefive?retryWrites=true&w=majority&appName=HiveFive
   ```

4. **Save the file**

### Step 3: Verify MongoDB Network Access

Make sure MongoDB Atlas allows connections from your IP:

1. Go to MongoDB Atlas → **Network Access**
2. Click **Add IP Address**
3. For development, add: `0.0.0.0/0` (Allow from anywhere)
4. Or add your specific IP address
5. Click **Confirm**

### Step 4: Start the Server

```bash
cd /Users/anvitakallam/Documents/HiveFive/backend
npm run dev
```

You should see:
```
Attempting to connect to MongoDB...
✅ MongoDB connected successfully: ...
Firebase Admin initialized from file path
Server is running on port 5001
```

## Quick Test

After updating the password, test the connection:

```bash
cd backend
node -e "require('dotenv').config(); const uri = process.env.MONGODB_URI.replace('<db_password>', 'YOUR_PASSWORD'); console.log('Connection string:', uri.replace(/\/\/.*@/, '//***:***@'));"
```

## Troubleshooting

### "MONGODB_URI environment variable is not set"
- Make sure you saved the `.env` file
- Make sure you're in the `backend/` directory
- Check that the file is named exactly `.env` (not `.env.txt`)

### "Authentication failed"
- Double-check your password (no extra spaces)
- Make sure the password doesn't contain special characters that need URL encoding
- Try resetting the password in MongoDB Atlas

### "Network timeout" or "Connection refused"
- Check MongoDB Atlas Network Access settings
- Make sure your IP is allowed (or use `0.0.0.0/0` for development)
- Check your internet connection

### "Server selection timeout"
- Verify the cluster name in the connection string: `hivefive.anukffg.mongodb.net`
- Check if the cluster is running in MongoDB Atlas
- Verify the username: `kranvita007_db_user`

## Once Server Starts

After the server starts successfully:
1. The frontend should connect automatically
2. You can test the API: http://localhost:5001/api/health
3. Try logging in and using the app

## Security Note

⚠️ **Never commit your `.env` file to git!** It's already in `.gitignore`, but double-check before committing.

