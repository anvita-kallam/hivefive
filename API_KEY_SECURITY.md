# 🔒 API Key Security Guide

## Understanding Frontend API Keys

**Important**: Frontend API keys (Firebase, Google Maps) **cannot be completely hidden** because they must be included in client-side JavaScript that runs in the browser. Anyone can view your website's source code and see these keys.

However, we can significantly reduce the risk by:

1. ✅ **Removing hardcoded keys from source code**
2. ✅ **Using environment variables only**
3. ✅ **Restricting keys in Google Cloud Console** (most important!)

## Current Security Status

✅ **Code Changes**: Hardcoded keys have been removed from source code
✅ **Environment Variables**: Keys are now loaded from `.env.local` (not in git)
⚠️ **Key Restrictions**: You need to restrict keys in Google Cloud Console

## Step 1: Create Environment File

1. Copy the example file:
   ```bash
   cp frontend/.env.local.example frontend/.env.local
   ```

2. Add your API keys to `frontend/.env.local`:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyBpgoBQkpHTKPOjBsXS8XNMf3wDQJTQSmg
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyChjQubjJduS4Gcu3CAs42wZK-trub-pCM
   # ... other config
   ```

3. **Important**: `.env.local` is already in `.gitignore`, so it won't be committed to git.

## Step 2: Restrict API Keys in Google Cloud Console

This is the **most important step**! Even if someone gets your API key, restrictions prevent them from using it.

### For Firebase API Key

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials?project=hivefive-477603)
2. Find your Firebase API key (starts with `AIzaSyBpgoBQkpHTKPOjBsXS8XNMf3wDQJTQSmg`)
3. Click on the key to edit it
4. Under **"Application restrictions"**:
   - Select **"HTTP referrers (web sites)"**
   - Add these referrers:
     - `http://localhost:3000/*` (for development)
     - `http://127.0.0.1:3000/*` (for development)
     - `https://yourdomain.com/*` (for production - replace with your actual domain)
     - `https://*.yourdomain.com/*` (for subdomains if needed)
5. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Choose only these APIs:
     - Firebase Authentication API
     - Firebase Installations API
     - Firebase Remote Config API
     - Cloud Storage JSON API (if using Firebase Storage)
6. Click **"Save"**

### For Google Maps API Key

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials?project=hivefive-477603)
2. Find your Google Maps API key (starts with `AIzaSyChjQubjJduS4Gcu3CAs42wZK-trub-pCM`)
3. Click on the key to edit it
4. Under **"Application restrictions"**:
   - Select **"HTTP referrers (web sites)"**
   - Add these referrers:
     - `http://localhost:3000/*` (for development)
     - `http://127.0.0.1:3000/*` (for development)
     - `https://yourdomain.com/*` (for production)
     - `https://*.yourdomain.com/*` (for subdomains)
5. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Choose only: **"Maps JavaScript API"**
6. Click **"Save"**

## Step 3: Monitor API Usage

1. Go to [Google Cloud Console - APIs & Services - Dashboard](https://console.cloud.google.com/apis/dashboard?project=hivefive-477603)
2. Check usage regularly for unexpected spikes
3. Set up usage alerts:
   - Go to [Billing - Budgets & Alerts](https://console.cloud.google.com/billing/budgets?project=hivefive-477603)
   - Create a budget alert for API usage

## How Restrictions Work

Even if someone finds your API key in your website's source code:

1. ✅ **HTTP Referrer Restrictions**: They can't use the key from unauthorized domains
2. ✅ **API Restrictions**: They can't use the key for unauthorized APIs
3. ✅ **Monitoring**: You'll be alerted to suspicious usage

## Best Practices

### Development
- Use different API keys for dev/staging/production
- Restrict dev keys to `localhost` only
- Never commit `.env.local` to git

### Production
- Use environment variables in your hosting platform (Vercel, Netlify, etc.)
- Set restrictions for your production domain only
- Monitor usage regularly
- Rotate keys periodically (every 6-12 months)

### If a Key is Compromised

1. **Immediately restrict the key** in Google Cloud Console
2. **Create a new key** with proper restrictions
3. **Update your `.env.local`** file
4. **Delete the old key** after switching
5. **Monitor for unauthorized usage**

## Testing Restrictions

After setting up restrictions, test that:

1. ✅ Your app works on `localhost:3000`
2. ✅ Your app works on your production domain
3. ❌ The key doesn't work from other domains (test in browser console on another site)

## Summary

- ✅ **Code**: No hardcoded keys (uses environment variables)
- ✅ **Git**: Keys not committed (`.env.local` is gitignored)
- ⚠️ **Console**: **You must restrict keys in Google Cloud Console** (this is critical!)
- ✅ **Monitoring**: Set up usage alerts

**The key restriction step is the most important!** Even with keys in environment variables, if someone gets them, restrictions prevent abuse.

