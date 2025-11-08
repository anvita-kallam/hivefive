# 🚀 Deployment Next Steps

## ✅ Current Status

- **Backend URL**: https://hivefive-production.up.railway.app
- **Frontend URL**: https://hivefiveconnect.vercel.app
- **Health Check**: https://hivefive-production.up.railway.app/api/health

## 📋 Immediate Actions Required

### 1. Update Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your `hivefiveconnect` project
3. Go to **Settings** → **Environment Variables**
4. Find `VITE_API_BASE_URL`
5. Update it to: `https://hivefive-production.up.railway.app/api`
6. Click **Save**
7. Go to **Deployments** tab
8. Click **Redeploy** on the latest deployment (or push a new commit)

### 2. Verify Railway Environment Variables

1. Go to [Railway Dashboard](https://railway.app/project/acb41216-873e-4eaf-9d91-6db083a27bca)
2. Select your service
3. Go to **Variables** tab
4. Verify these are set correctly:
   - `GOOGLE_REDIRECT_URI` = `https://hivefive-production.up.railway.app/api/calendar/callback`
   - `FRONTEND_URL` = `https://hivefiveconnect.vercel.app`
5. If not set, add them and redeploy

### 3. Update Google Cloud OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: `hivefive-477603`
3. Go to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID: `231258515997-3vequ4hjt1v8daoa7vu2hvikd971otmu`
5. Click on it to edit
6. Under **Authorized redirect URIs**, add:
   - `https://hivefive-production.up.railway.app/api/calendar/callback`
7. Click **Save**

### 4. Verify Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `hivefive-477603`
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Verify these domains are added:
   - `hivefiveconnect.vercel.app`
   - `hivefive-production.up.railway.app` (if needed)
5. If not, click **Add domain** and add them

### 5. Update Google Cloud API Key Restrictions

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: `hivefive-477603`
3. Go to **APIs & Services** → **Credentials**
4. For **Firebase API Key**:
   - Click on the API key
   - Under **HTTP referrers (web sites)**, add:
     - `https://hivefiveconnect.vercel.app/*`
     - `https://*.vercel.app/*` (for preview deployments)
5. For **Google Maps API Key**:
   - Click on the API key
   - Under **HTTP referrers (web sites)**, add:
     - `https://hivefiveconnect.vercel.app/*`
     - `https://*.vercel.app/*` (for preview deployments)

### 6. Test Deployment

1. **Test Backend Health**:
   ```bash
   curl https://hivefive-production.up.railway.app/api/health
   ```
   Expected response: `{"status":"ok","message":"HiveFive API is running"}`

2. **Test Frontend**:
   - Visit: https://hivefiveconnect.vercel.app
   - Check browser console for errors
   - Try signing in with Google
   - Verify API calls are working

3. **Test Authentication**:
   - Sign in with Google
   - Verify user profile loads
   - Check that API calls include authentication tokens

4. **Test Features**:
   - Create a hive
   - Create an event
   - Upload media
   - Edit profile

## 🔍 Troubleshooting

### Backend Not Responding

1. Check Railway logs:
   - Go to Railway Dashboard
   - Select your service
   - Check **Deployments** tab for errors
   - Check **Logs** tab for runtime errors

2. Verify environment variables:
   - Check all required variables are set
   - Verify `FIREBASE_ADMIN_SDK` is valid JSON
   - Check MongoDB connection string

3. Check health endpoint:
   - Visit: https://hivefive-production.up.railway.app/api/health
   - Should return: `{"status":"ok","message":"HiveFive API is running"}`

### Frontend Not Connecting to Backend

1. Verify `VITE_API_BASE_URL` in Vercel:
   - Should be: `https://hivefive-production.up.railway.app/api`
   - Redeploy frontend after updating

2. Check browser console:
   - Look for CORS errors
   - Check network requests
   - Verify API calls are going to correct URL

3. Check CORS configuration:
   - Verify `FRONTEND_URL` is set in Railway
   - Should be: `https://hivefiveconnect.vercel.app`

### Authentication Not Working

1. Check Firebase configuration:
   - Verify authorized domains
   - Check API key restrictions
   - Verify Firebase project ID matches

2. Check backend logs:
   - Look for authentication errors
   - Verify Firebase Admin SDK is configured correctly
   - Check token verification

3. Check Google OAuth:
   - Verify redirect URI is set correctly
   - Check OAuth client ID and secret
   - Verify redirect URI is authorized in Google Cloud

### CORS Errors

1. Verify `FRONTEND_URL` in Railway:
   - Should be: `https://hivefiveconnect.vercel.app`
   - Redeploy backend after updating

2. Check backend CORS configuration:
   - Verify frontend URL is in allowed origins
   - Check CORS middleware is configured correctly

## ✅ Verification Checklist

- [ ] Backend health check returns OK
- [ ] Frontend loads without errors
- [ ] Google Sign-In works
- [ ] User profile loads after sign-in
- [ ] API calls work from frontend
- [ ] CORS is configured correctly
- [ ] Firebase authorized domains are set
- [ ] Google Cloud API key restrictions are set
- [ ] Google OAuth redirect URI is authorized
- [ ] All environment variables are set correctly

## 📞 Support

If you encounter issues:

1. Check Railway logs for backend errors
2. Check Vercel logs for frontend errors
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly
5. Check Firebase and Google Cloud Console settings
6. Review deployment documentation:
   - `DEPLOYMENT.md`
   - `RAILWAY_SETUP.md`
   - `DEPLOYMENT_QUICK_START.md`

## 🎉 Success!

Once all steps are completed:

- ✅ Your app should be fully deployed
- ✅ Frontend and backend should be connected
- ✅ Authentication should work
- ✅ All features should be functional

Congratulations on deploying HiveFive! 🚀

