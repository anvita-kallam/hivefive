# 🚂 Railway Deployment Setup

## Project Information

- **Railway Project ID**: `acb41216-873e-4eaf-9d91-6db083a27bca`
- **Railway Project URL**: https://railway.app/project/acb41216-873e-4eaf-9d91-6db083a27bca
- **Frontend URL**: https://hivefiveconnect.vercel.app

## Deployment Steps

### 1. Connect Repository

1. Go to [Railway Dashboard](https://railway.app)
2. Open your project (ID: `acb41216-873e-4eaf-9d91-6db083a27bca`)
3. Click "New Service"
4. Select "GitHub Repo"
5. Select your `hivefive` repository
6. Select the `main` branch

### 2. Configure Service

1. **Set Root Directory**: `backend`
2. **Build Command**: `npm install` (auto-detected)
3. **Start Command**: `npm start` (auto-detected)
4. **Port**: Railway will automatically assign a port

### 3. Add Environment Variables

Go to the **Variables** tab and add all variables from `DEPLOYMENT_ENV_VALUES.local.md`:

#### Required Variables:

```env
PORT=5001
NODE_ENV=production
MONGODB_URI=mongodb+srv://kranvita007_db_user:Ga9tXmIA156MFaT2@hivefive.anukffg.mongodb.net/?appName=HiveFive
FIREBASE_ADMIN_SDK=<paste entire JSON from DEPLOYMENT_ENV_VALUES.local.md>
GOOGLE_CLIENT_ID=231258515997-3vequ4hjt1v8daoa7vu2hvikd971otmu.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<get from Google Cloud Console>
GOOGLE_REDIRECT_URI=https://your-backend-url.railway.app/api/calendar/callback
VERTEX_AI_PROJECT_ID=hivefive-477603
VERTEX_AI_LOCATION=us-central1
JWT_SECRET=hhsgdsg663bbansjhcgsjskdhdhjs
FRONTEND_URL=https://hivefiveconnect.vercel.app
```

**Important Notes**:
- `FIREBASE_ADMIN_SDK`: Copy the entire JSON from `DEPLOYMENT_ENV_VALUES.local.md` as a single-line string
- `GOOGLE_CLIENT_SECRET`: Get from Google Cloud Console (should be different from Client ID)
- `GOOGLE_REDIRECT_URI`: Update after deployment with your actual Railway backend URL

### 4. Deploy

1. Railway will automatically deploy when you push to `main` branch
2. Wait for deployment to complete
3. Get your backend URL from the deployment (e.g., `https://hivefive-backend-production.up.railway.app`)

### 5. Update URLs

After deployment, update:

1. **GOOGLE_REDIRECT_URI** in Railway:
   - Go to Variables tab
   - Update `GOOGLE_REDIRECT_URI` to: `https://your-actual-railway-url.railway.app/api/calendar/callback`
   - Redeploy if needed

2. **VITE_API_BASE_URL** in Vercel:
   - Go to Vercel project settings
   - Update `VITE_API_BASE_URL` to: `https://your-actual-railway-url.railway.app/api`
   - Redeploy frontend

3. **Google Cloud OAuth Redirect URI**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - APIs & Services → Credentials
   - Edit your OAuth 2.0 Client ID
   - Add authorized redirect URI: `https://your-actual-railway-url.railway.app/api/calendar/callback`

### 6. Verify Deployment

1. Check Railway logs for any errors
2. Test the health endpoint: `https://your-railway-url.railway.app/api/health`
3. Test frontend connection to backend
4. Test authentication flow

## Troubleshooting

### Deployment Fails

1. Check build logs in Railway
2. Verify all environment variables are set
3. Check that `FIREBASE_ADMIN_SDK` is a valid JSON string
4. Verify MongoDB connection string is correct

### Environment Variables Not Working

1. Ensure variables are set in Railway Variables tab
2. Redeploy after adding/changing variables
3. Check variable names match exactly (case-sensitive)

### Backend URL Not Working

1. Check Railway deployment logs
2. Verify PORT is set correctly
3. Check that the service is running
4. Test health endpoint: `/api/health`

### CORS Errors

1. Ensure `FRONTEND_URL` is set to: `https://hivefiveconnect.vercel.app`
2. Check backend CORS configuration
3. Verify frontend is making requests to correct backend URL

## Railway Service URLs

- **Project Dashboard**: https://railway.app/project/acb41216-873e-4eaf-9d91-6db083a27bca
- **Backend URL**: Will be shown after deployment in Railway dashboard

## Related Documentation

- See `DEPLOYMENT_ENV_VALUES.local.md` for all environment variable values
- See `DEPLOYMENT.md` for complete deployment guide
- See `DEPLOYMENT_QUICK_START.md` for quick reference

