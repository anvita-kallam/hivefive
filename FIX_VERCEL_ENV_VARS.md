# 🚨 Fix: Missing VITE_GOOGLE_MAPS_API_KEY Error

## The Problem

You're seeing this error in your browser console:
```
Uncaught Error: Missing required environment variable: VITE_GOOGLE_MAPS_API_KEY
```

This means the environment variable is not set in Vercel, or the deployment doesn't have it.

## Solution: Add Environment Variables to Vercel

### Step 1: Open Vercel Dashboard

1. Go to: **https://vercel.com/dashboard**
2. Sign in if needed
3. Find and click on your project: **hivefiveconnect** (or whatever you named it)

### Step 2: Go to Environment Variables

1. Click on the **Settings** tab (top navigation)
2. Click on **Environment Variables** in the left sidebar
3. You should see a list of existing environment variables (if any)

### Step 3: Add VITE_GOOGLE_MAPS_API_KEY

1. Click the **"Add New"** button (or **"Add"** button)
2. In the **Key** field, enter exactly: `VITE_GOOGLE_MAPS_API_KEY`
   - **Important**: Case-sensitive, must match exactly
   - Must start with `VITE_`
3. In the **Value** field, enter: `AIzaSyChjQubjJduS4Gcu3CAs42wZK-trub-pCM`
4. Under **Environment**, check ALL three boxes:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. Click **Save**

### Step 4: Add ALL Other Required Variables

You need to add ALL of these variables. Here's the complete list:

#### 1. VITE_FIREBASE_API_KEY
- **Key**: `VITE_FIREBASE_API_KEY`
- **Value**: `AIzaSyBpgoBQkpHTKPOjBsXS8XNMf3wDQJTQSmg`
- **Environment**: Production, Preview, Development

#### 2. VITE_FIREBASE_AUTH_DOMAIN
- **Key**: `VITE_FIREBASE_AUTH_DOMAIN`
- **Value**: `hivefive-477603.firebaseapp.com`
- **Environment**: Production, Preview, Development

#### 3. VITE_FIREBASE_PROJECT_ID
- **Key**: `VITE_FIREBASE_PROJECT_ID`
- **Value**: `hivefive-477603`
- **Environment**: Production, Preview, Development

#### 4. VITE_FIREBASE_STORAGE_BUCKET
- **Key**: `VITE_FIREBASE_STORAGE_BUCKET`
- **Value**: `hivefive-477603.firebasestorage.app`
- **Environment**: Production, Preview, Development

#### 5. VITE_FIREBASE_MESSAGING_SENDER_ID
- **Key**: `VITE_FIREBASE_MESSAGING_SENDER_ID`
- **Value**: `231258515997`
- **Environment**: Production, Preview, Development

#### 6. VITE_FIREBASE_APP_ID
- **Key**: `VITE_FIREBASE_APP_ID`
- **Value**: `1:231258515997:web:827c3520193ef0e7fcf4f4`
- **Environment**: Production, Preview, Development

#### 7. VITE_FIREBASE_MEASUREMENT_ID
- **Key**: `VITE_FIREBASE_MEASUREMENT_ID`
- **Value**: `G-GC7V2BFH44`
- **Environment**: Production, Preview, Development

#### 8. VITE_GOOGLE_MAPS_API_KEY ⚠️ (This is the one causing the error)
- **Key**: `VITE_GOOGLE_MAPS_API_KEY`
- **Value**: `AIzaSyChjQubjJduS4Gcu3CAs42wZK-trub-pCM`
- **Environment**: Production, Preview, Development

#### 9. VITE_API_BASE_URL
- **Key**: `VITE_API_BASE_URL`
- **Value**: `https://hivefive-production.up.railway.app/api`
- **Environment**: Production, Preview, Development

### Step 5: Verify All Variables Are Added

After adding all variables, you should see 9 variables in the list:

1. ✅ VITE_FIREBASE_API_KEY
2. ✅ VITE_FIREBASE_AUTH_DOMAIN
3. ✅ VITE_FIREBASE_PROJECT_ID
4. ✅ VITE_FIREBASE_STORAGE_BUCKET
5. ✅ VITE_FIREBASE_MESSAGING_SENDER_ID
6. ✅ VITE_FIREBASE_APP_ID
7. ✅ VITE_FIREBASE_MEASUREMENT_ID
8. ✅ VITE_GOOGLE_MAPS_API_KEY
9. ✅ VITE_API_BASE_URL

### Step 6: Redeploy (CRITICAL!)

**Environment variables only take effect after redeployment!**

1. Click on the **Deployments** tab (top navigation)
2. Find the latest deployment
3. Click on the **three dots** (⋯) menu on the right
4. Click **Redeploy**
5. Confirm by clicking **Redeploy** again
6. Wait for the deployment to complete (usually 1-2 minutes)

### Step 7: Verify the Fix

1. Once deployment completes, visit: **https://hivefiveconnect.vercel.app**
2. Open browser console (F12 or Right-click → Inspect → Console)
3. The error should be gone
4. Try refreshing the page (Ctrl+Shift+R or Cmd+Shift+R to hard refresh)

## Common Mistakes to Avoid

### ❌ Wrong: Adding variable but not redeploying
- **Fix**: You MUST redeploy after adding variables

### ❌ Wrong: Adding variable to only one environment
- **Fix**: Check ALL three environments (Production, Preview, Development)

### ❌ Wrong: Typo in variable name
- **Fix**: Must be exactly `VITE_GOOGLE_MAPS_API_KEY` (case-sensitive)

### ❌ Wrong: Extra spaces in variable name or value
- **Fix**: Copy-paste directly, no extra spaces

### ❌ Wrong: Using wrong value
- **Fix**: Use the exact value: `AIzaSyChjQubjJduS4Gcu3CAs42wZK-trub-pCM`

## Quick Checklist

- [ ] Opened Vercel Dashboard
- [ ] Went to Settings → Environment Variables
- [ ] Added VITE_GOOGLE_MAPS_API_KEY
- [ ] Added all 8 other required variables
- [ ] Selected all environments (Production, Preview, Development) for each variable
- [ ] Clicked Save for each variable
- [ ] Went to Deployments tab
- [ ] Clicked Redeploy on latest deployment
- [ ] Waited for deployment to complete
- [ ] Visited the site and checked console (error should be gone)

## Still Not Working?

### Check Deployment Logs

1. Go to Deployments tab
2. Click on the latest deployment
3. Check the build logs
4. Look for any errors related to environment variables

### Verify Variables Are Set

1. Go to Settings → Environment Variables
2. Verify all 9 variables are listed
3. Click on each variable to verify the value is correct
4. Verify all environments are selected

### Clear Browser Cache

1. Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. Or clear browser cache completely
3. Try in incognito/private mode

### Check Variable Names

Make sure variable names match exactly:
- ✅ `VITE_GOOGLE_MAPS_API_KEY` (correct)
- ❌ `VITE_GOOGLE_MAP_API_KEY` (wrong - missing S)
- ❌ `GOOGLE_MAPS_API_KEY` (wrong - missing VITE_)
- ❌ `vite_google_maps_api_key` (wrong - lowercase)

## Need Help?

If you're still having issues:

1. Check `DEPLOYMENT_ENV_VALUES.local.md` for all values
2. Check `VERCEL_ENV_VARIABLES.md` for detailed instructions
3. Check Vercel documentation: https://vercel.com/docs/environment-variables
4. Verify your Vercel project is connected to the correct GitHub repository

## Success!

Once you've completed all steps:

- ✅ Error should be gone
- ✅ Google Maps should load
- ✅ All features should work
- ✅ Site should be fully functional

🎉 Congratulations! Your deployment should now be working!

