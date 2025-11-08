# 🔧 Fix MongoDB Connection Timeout

## The Problem

You're seeing this error:
```
Operation `users.findOne()` buffering timed out after 10000ms
```

This means the backend can't connect to MongoDB Atlas from Railway.

## Common Causes

1. **MongoDB Atlas Network Access**: Railway IP addresses not whitelisted
2. **MongoDB Connection String**: Not set or incorrect in Railway
3. **Database User**: Incorrect credentials or permissions
4. **Connection String Format**: Malformed or missing parameters

## Solutions

### Solution 1: Configure MongoDB Atlas Network Access (Most Common)

MongoDB Atlas blocks connections by default. You need to allow Railway to connect.

#### Option A: Allow All IPs (Easiest for Development)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Select your cluster
3. Click **Network Access** in the left sidebar
4. Click **Add IP Address**
5. Click **Allow Access from Anywhere**
6. Enter `0.0.0.0/0` in the IP Address field
7. Add a comment: "Allow Railway deployment"
8. Click **Confirm**
9. Wait 1-2 minutes for changes to propagate

#### Option B: Allow Specific IPs (More Secure)

Railway uses dynamic IPs, so you'll need to:
1. Check Railway deployment logs for the IP address being used
2. Add that IP to MongoDB Atlas Network Access
3. Note: IPs may change, so Option A is easier for development

### Solution 2: Verify MongoDB Connection String in Railway

1. Go to [Railway Dashboard](https://railway.app/project/acb41216-873e-4eaf-9d91-6db083a27bca)
2. Select your backend service
3. Go to **Variables** tab
4. Verify `MONGODB_URI` is set correctly:
   ```
   mongodb+srv://kranvita007_db_user:Ga9tXmIA156MFaT2@hivefive.anukffg.mongodb.net/?appName=HiveFive
   ```
5. **Important**: Make sure the connection string includes:
   - Database name: Add `?retryWrites=true&w=majority` or `/hivefive?retryWrites=true&w=majority`
   - Correct format: `mongodb+srv://username:password@cluster.mongodb.net/database?options`

### Solution 3: Update Connection String Format

The connection string should be:
```
mongodb+srv://kranvita007_db_user:Ga9tXmIA156MFaT2@hivefive.anukffg.mongodb.net/hivefive?retryWrites=true&w=majority
```

Or with appName:
```
mongodb+srv://kranvita007_db_user:Ga9tXmIA156MFaT2@hivefive.anukffg.mongodb.net/hivefive?retryWrites=true&w=majority&appName=HiveFive
```

### Solution 4: Verify Database User Credentials

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **Database Access** in the left sidebar
3. Find user: `kranvita007_db_user`
4. Verify the password is correct
5. Verify user has **Read and write to any database** permissions
6. If password is wrong, reset it and update Railway

### Solution 5: Check Database Connection in Code

The database connection code should handle errors properly. Verify `backend/src/config/database.js` has proper error handling.

## Step-by-Step Fix

### Step 1: Allow All IPs in MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Select your cluster
3. Click **Network Access**
4. Click **Add IP Address**
5. Click **Allow Access from Anywhere** (or enter `0.0.0.0/0`)
6. Click **Confirm**
7. Wait 1-2 minutes

### Step 2: Verify Connection String in Railway

1. Go to Railway Dashboard
2. Select your backend service
3. Go to **Variables** tab
4. Verify `MONGODB_URI` is set to:
   ```
   mongodb+srv://kranvita007_db_user:Ga9tXmIA156MFaT2@hivefive.anukffg.mongodb.net/hivefive?retryWrites=true&w=majority
   ```
5. If not set correctly, update it:
   - Click on `MONGODB_URI`
   - Update the value
   - Click **Save**
   - Redeploy

### Step 3: Test Connection

After updating:

1. Check Railway deployment logs
2. Look for: "MongoDB connected successfully" or similar
3. If still timing out, check for error messages
4. Test the health endpoint: https://hivefive-production.up.railway.app/api/health

### Step 4: Verify Database User

1. Go to MongoDB Atlas
2. Click **Database Access**
3. Verify user exists and has correct permissions
4. If needed, reset password and update Railway

## Updated Connection String

Use this format in Railway:

```env
MONGODB_URI=mongodb+srv://kranvita007_db_user:Ga9tXmIA156MFaT2@hivefive.anukffg.mongodb.net/hivefive?retryWrites=true&w=majority
```

Or with appName:

```env
MONGODB_URI=mongodb+srv://kranvita007_db_user:Ga9tXmIA156MFaT2@hivefive.anukffg.mongodb.net/hivefive?retryWrites=true&w=majority&appName=HiveFive
```

## Troubleshooting

### Still Timing Out?

1. **Check MongoDB Atlas Network Access**:
   - Verify `0.0.0.0/0` is in the list
   - Wait 1-2 minutes after adding
   - Check if IP is in "Pending" state

2. **Check Connection String**:
   - Verify username and password are correct
   - Check for special characters in password (may need URL encoding)
   - Verify cluster name is correct
   - Check database name is included

3. **Check Railway Logs**:
   - Look for connection errors
   - Check if MONGODB_URI is being read
   - Look for authentication errors

4. **Test Connection Locally**:
   ```bash
   # Test connection string locally
   mongosh "mongodb+srv://kranvita007_db_user:Ga9tXmIA156MFaT2@hivefive.anukffg.mongodb.net/hivefive?retryWrites=true&w=majority"
   ```

5. **Check Database User Permissions**:
   - User should have "Read and write to any database" or "Atlas admin"
   - Verify user is not restricted to specific databases

### Connection String Encoding

If your password has special characters, they may need to be URL-encoded:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

## Verification

After fixing:

- [ ] MongoDB Atlas Network Access allows `0.0.0.0/0`
- [ ] `MONGODB_URI` is set correctly in Railway
- [ ] Connection string includes database name
- [ ] Database user has correct permissions
- [ ] Railway deployment logs show successful connection
- [ ] Health endpoint works
- [ ] API endpoints work

## Expected Behavior

After the fix:

- ✅ Backend connects to MongoDB successfully
- ✅ No timeout errors in logs
- ✅ API endpoints work
- ✅ Database operations succeed

## Related Documentation

- See `DEPLOYMENT_ENV_VALUES.local.md` for MongoDB connection string
- See `RAILWAY_SETUP.md` for Railway configuration
- See `MONGODB_SETUP.md` for MongoDB Atlas setup

