# 🚀 Quick Deployment Guide

## Fastest Way to Deploy

### Frontend (Vercel) - 5 minutes

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - **IMPORTANT**: Click "Configure Project" → Set Root Directory to `frontend`
   - Framework Preset: Vite (auto-detected)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)
   - Add environment variables (see below)
   - Click "Deploy"

3. **Get Frontend URL**:
   - Vercel will give you a URL like `your-app.vercel.app`
   - Save this URL

### Backend (Railway) - 5 minutes

1. **Deploy to Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository
   - Add a new service
   - Set root directory to `backend`

2. **Add Environment Variables**:
   - Go to Variables tab
   - Add all variables (see below)
   - For `FIREBASE_ADMIN_SDK`, paste the entire JSON content

3. **Get Backend URL**:
   - Railway will give you a URL like `your-app.up.railway.app`
   - Save this URL

### Update Frontend Environment Variables

1. Go back to Vercel
2. Update `VITE_API_BASE_URL` to your Railway backend URL:
   ```
   VITE_API_BASE_URL=https://your-app.up.railway.app/api
   ```
3. Redeploy (automatic on variable change)

### Update Backend CORS

1. Go to Railway → Variables
2. Add:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Redeploy

### Test Deployment

1. Visit your frontend URL
2. Try signing in
3. Check browser console for errors
4. Check backend logs in Railway

## Environment Variables Checklist

### Frontend (Vercel)
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] `VITE_FIREBASE_MEASUREMENT_ID`
- [ ] `VITE_GOOGLE_MAPS_API_KEY`
- [ ] `VITE_API_BASE_URL` (your backend URL)

### Backend (Railway)
- [ ] `PORT=5001`
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI`
- [ ] `FIREBASE_ADMIN_SDK` (entire JSON as string)
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GOOGLE_REDIRECT_URI` (your backend URL + `/api/calendar/callback`)
- [ ] `VERTEX_AI_PROJECT_ID`
- [ ] `VERTEX_AI_LOCATION`
- [ ] `JWT_SECRET` (random string)
- [ ] `FRONTEND_URL` (your frontend URL)

## Firebase Setup

1. **Add Authorized Domain**:
   - Firebase Console → Authentication → Settings
   - Add your Vercel domain

2. **Restrict API Keys**:
   - Google Cloud Console → Credentials
   - Add your Vercel domain to HTTP referrers
   - Add API restrictions

3. **Deploy Storage Rules**:
   - Firebase Console → Storage → Rules
   - Copy rules from `firebase-storage.rules`
   - Paste and publish

## Google Cloud Setup

1. **Update OAuth Redirect URI**:
   - Google Cloud Console → Credentials
   - Edit OAuth Client ID
   - Add: `https://your-backend-url.com/api/calendar/callback`

2. **Update API Key Restrictions**:
   - Add your Vercel domain to HTTP referrers
   - Restrict to necessary APIs only

## Common Issues

### CORS Errors
- Check `FRONTEND_URL` is set in backend
- Check frontend URL matches backend CORS config
- Check backend is using HTTPS

### Authentication Fails
- Check Firebase authorized domains
- Check API key restrictions
- Check Firebase Admin SDK credentials

### API Calls Fail
- Check `VITE_API_BASE_URL` is correct
- Check backend is running
- Check CORS configuration
- Check backend logs

## Next Steps

1. ✅ Test all features
2. ✅ Set up custom domain (optional)
3. ✅ Enable monitoring
4. ✅ Set up error tracking
5. ✅ Configure backups

## Need Help?

- Check `DEPLOYMENT.md` for detailed instructions
- Check backend logs in Railway
- Check browser console for frontend errors
- Check Firebase Console for auth issues

