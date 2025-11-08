# 🔧 Vercel Environment Variables Setup

## Missing Environment Variable Error

If you see this error:
```
Uncaught Error: Missing required environment variable: VITE_GOOGLE_MAPS_API_KEY
```

This means the environment variable is not set in Vercel.

## Quick Fix

### Step 1: Go to Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project: `hivefiveconnect` (or your project name)
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar

### Step 2: Add All Required Environment Variables

Add these environment variables (copy from `DEPLOYMENT_ENV_VALUES.local.md`):

#### Frontend Environment Variables (Vercel)

```env
VITE_FIREBASE_API_KEY=AIzaSyBpgoBQkpHTKPOjBsXS8XNMf3wDQJTQSmg
VITE_FIREBASE_AUTH_DOMAIN=hivefive-477603.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hivefive-477603
VITE_FIREBASE_STORAGE_BUCKET=hivefive-477603.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=231258515997
VITE_FIREBASE_APP_ID=1:231258515997:web:827c3520193ef0e7fcf4f4
VITE_FIREBASE_MEASUREMENT_ID=G-GC7V2BFH44
VITE_GOOGLE_MAPS_API_KEY=AIzaSyChjQubjJduS4Gcu3CAs42wZK-trub-pCM
VITE_API_BASE_URL=https://hivefive-production.up.railway.app/api
```

### Step 3: Add Each Variable

For each variable above:

1. Click **Add New** button
2. Enter the **Key** (e.g., `VITE_GOOGLE_MAPS_API_KEY`)
3. Enter the **Value** (e.g., `AIzaSyChjQubjJduS4Gcu3CAs42wZK-trub-pCM`)
4. Select **Environment**: 
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **Save**

### Step 4: Redeploy

After adding all variables:

1. Go to **Deployments** tab
2. Click on the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

## Complete Environment Variables List

Copy these exact values:

| Variable | Value |
|---------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyBpgoBQkpHTKPOjBsXS8XNMf3wDQJTQSmg` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `hivefive-477603.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `hivefive-477603` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `hivefive-477603.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `231258515997` |
| `VITE_FIREBASE_APP_ID` | `1:231258515997:web:827c3520193ef0e7fcf4f4` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-GC7V2BFH44` |
| `VITE_GOOGLE_MAPS_API_KEY` | `AIzaSyChjQubjJduS4Gcu3CAs42wZK-trub-pCM` |
| `VITE_API_BASE_URL` | `https://hivefive-production.up.railway.app/api` |

## Verification

After redeploying, check:

1. Visit your frontend: https://hivefiveconnect.vercel.app
2. Open browser console (F12)
3. The error should be gone
4. Google Maps should load (if you're on a page that uses maps)

## Troubleshooting

### Error Still Appears After Adding Variables

1. **Check variable names**: Must start with `VITE_` and match exactly (case-sensitive)
2. **Check environments**: Make sure variables are added for Production, Preview, AND Development
3. **Redeploy**: Variables only take effect after redeployment
4. **Clear cache**: Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### Variables Not Showing in Build

1. **Check Vercel build logs**: Go to Deployments → Click on deployment → View build logs
2. **Verify variable names**: Must be exactly as shown (case-sensitive)
3. **Check for typos**: Common mistakes: `VITE_` vs `VITE`, extra spaces, wrong quotes

### Still Having Issues?

1. Check `DEPLOYMENT_ENV_VALUES.local.md` for all values
2. Verify all variables are added in Vercel
3. Check Vercel build logs for errors
4. Make sure you redeployed after adding variables

## Quick Copy-Paste

If you want to add them all at once, you can use Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link to your project
cd frontend
vercel link

# Add all variables
vercel env add VITE_FIREBASE_API_KEY production
# (paste value when prompted)
# Repeat for each variable...
```

Or use the Vercel Dashboard (easier for most users).

