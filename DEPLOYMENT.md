# 🚀 HiveFive Deployment Guide

This guide covers deploying HiveFive to production, including frontend, backend, database, and cloud services.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Frontend Deployment](#frontend-deployment)
3. [Backend Deployment](#backend-deployment)
4. [Database Setup](#database-setup)
5. [Environment Variables](#environment-variables)
6. [Firebase Configuration](#firebase-configuration)
7. [Google Cloud Setup](#google-cloud-setup)
8. [Domain Configuration](#domain-configuration)
9. [Post-Deployment Checklist](#post-deployment-checklist)

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ MongoDB Atlas account
- ✅ Firebase project created
- ✅ Google Cloud project with APIs enabled
- ✅ Domain name (optional but recommended)
- ✅ Git repository (GitHub)

## Frontend Deployment

### Option 1: Vercel (Recommended)

Vercel is the easiest option for React/Vite apps.

#### Steps:

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Root Directory**: `frontend`
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Environment Variables** (in Vercel Dashboard):
   - Go to Project Settings → Environment Variables
   - Add all variables (see `DEPLOYMENT_ENV_VALUES.local.md` for actual values):
     ```
     VITE_FIREBASE_API_KEY=AIzaSyBpgoBQkpHTKPOjBsXS8XNMf3wDQJTQSmg
     VITE_FIREBASE_AUTH_DOMAIN=hivefive-477603.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=hivefive-477603
     VITE_FIREBASE_STORAGE_BUCKET=hivefive-477603.firebasestorage.app
     VITE_FIREBASE_MESSAGING_SENDER_ID=231258515997
     VITE_FIREBASE_APP_ID=1:231258515997:web:827c3520193ef0e7fcf4f4
     VITE_FIREBASE_MEASUREMENT_ID=G-GC7V2BFH44
     VITE_GOOGLE_MAPS_API_KEY=AIzaSyChjQubjJduS4Gcu3CAs42wZK-trub-pCM
     VITE_API_BASE_URL=https://your-backend-url.railway.app/api
     ```
   - **Note**: Update `VITE_API_BASE_URL` after deploying your backend!

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically deploy on every push to main branch

#### Custom Domain:
- Go to Project Settings → Domains
- Add your custom domain
- Follow DNS configuration instructions

### Option 2: Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy via Netlify Dashboard**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login with GitHub
   - Click "New site from Git"
   - Select your repository
   - Configure:
     - **Base directory**: `frontend`
     - **Build command**: `npm run build`
     - **Publish directory**: `frontend/dist`

3. **Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Add all `VITE_*` variables

4. **Deploy**:
   - Netlify will auto-deploy on push to main

### Option 3: AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Connect your GitHub repository
3. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/dist
       files:
         - '**/*'
     cache:
       paths:
         - frontend/node_modules/**/*
   ```
4. Add environment variables
5. Deploy

## Backend Deployment

### Option 1: Railway (Recommended)

Railway is easy and has good MongoDB integration.

#### Steps:

1. **Sign up**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository

3. **Configure Service**:
   - Add a new service
   - Select your repository
   - Set root directory to `backend`
   - Railway will auto-detect Node.js

4. **Environment Variables**:
   - Go to Variables tab
   - Add all variables (see `DEPLOYMENT_ENV_VALUES.local.md` for actual values):
     ```
     PORT=5001
     NODE_ENV=production
     MONGODB_URI=<see DEPLOYMENT_ENV_VALUES.local.md>
     FIREBASE_ADMIN_SDK=<paste entire JSON from DEPLOYMENT_ENV_VALUES.local.md>
     GOOGLE_CLIENT_ID=<get from Google Cloud Console>
     GOOGLE_CLIENT_SECRET=<get from Google Cloud Console>
     GOOGLE_REDIRECT_URI=https://your-backend-url.railway.app/api/calendar/callback
     VERTEX_AI_PROJECT_ID=hivefive-477603
     VERTEX_AI_LOCATION=us-central1
     JWT_SECRET=<generate using: openssl rand -base64 32>
     FRONTEND_URL=https://your-frontend-url.vercel.app
     ```
     
   **⚠️ Important**: See `DEPLOYMENT_ENV_VALUES.local.md` (in your local project) for actual values including MongoDB URI and Firebase Admin SDK JSON.

5. **Upload Firebase Admin SDK**:
   - Go to Variables tab
   - Add a variable named `FIREBASE_ADMIN_SDK`
   - Copy the entire JSON content from `DEPLOYMENT_ENV_VALUES.local.md` (as a single-line string)
   - Paste it as the value
   - **Note**: The JSON should be minified (all on one line)

6. **Deploy**:
   - Railway will auto-deploy on push to main
   - Get your backend URL from the deployment

### Option 2: Render

1. **Sign up**:
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: hivefive-backend
     - **Root Directory**: `backend`
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Environment Variables**:
   - Add all variables from `backend/.env`
   - For Firebase Admin SDK, use environment variable (see Railway instructions)

4. **Deploy**:
   - Render will auto-deploy on push

### Option 3: Heroku

1. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku App**:
   ```bash
   cd backend
   heroku create your-app-name
   ```

3. **Configure Buildpacks**:
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

4. **Environment Variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongodb-uri
   # ... add all other variables
   ```

5. **Deploy**:
   ```bash
   git push heroku main
   ```

### Option 4: AWS EC2 / DigitalOcean

1. **Create Server**:
   - Create Ubuntu 22.04 instance
   - SSH into server

2. **Install Dependencies**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo apt-get install -y nginx
   ```

3. **Clone Repository**:
   ```bash
   git clone https://github.com/your-username/hivefive.git
   cd hivefive/backend
   npm install --production
   ```

4. **Install PM2**:
   ```bash
   sudo npm install -g pm2
   pm2 start src/server.js --name hivefive-backend
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Environment Variables**:
   - Create `/etc/environment` or use `.env` file
   - Add all required variables

## Database Setup

### MongoDB Atlas

1. **Create Cluster**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster (M0)

2. **Configure Network Access**:
   - Go to Network Access
   - Add IP address: `0.0.0.0/0` (allow all) or your server IPs
   - For production, restrict to your server IPs only

3. **Create Database User**:
   - Go to Database Access
   - Create a new user with read/write permissions
   - Save the username and password

4. **Get Connection String**:
   - Go to Clusters → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Add to `MONGODB_URI` environment variable

5. **Update Backend**:
   - Use the connection string in your backend environment variables

## Environment Variables

### Frontend (.env.production)

Create `frontend/.env.production`:

```env
VITE_FIREBASE_API_KEY=your-production-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
VITE_API_BASE_URL=https://your-backend-url.com/api
```

### Backend (.env)

For production backend:

```env
PORT=5001
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hivefive?retryWrites=true&w=majority
FIREBASE_ADMIN_SDK_PATH=./firebase-admin-sdk.json
# OR use environment variable (recommended for cloud):
FIREBASE_ADMIN_SDK={"type":"service_account",...}
GOOGLE_CLIENT_ID=your-oauth-client-id
GOOGLE_CLIENT_SECRET=your-oauth-client-secret
GOOGLE_REDIRECT_URI=https://your-backend-url.com/api/calendar/callback
VERTEX_AI_PROJECT_ID=your-gcp-project-id
VERTEX_AI_LOCATION=us-central1
JWT_SECRET=your-random-secret-key-here
```

## Firebase Configuration

### 1. Update Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Authentication → Settings → Authorized domains
4. Add your production domain (e.g., `yourdomain.com`)

### 2. Update API Key Restrictions

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Go to APIs & Services → Credentials
3. For Firebase API key:
   - Add HTTP referrer: `https://yourdomain.com/*`
   - Add API restrictions (Firebase APIs only)
4. For Google Maps API key:
   - Add HTTP referrer: `https://yourdomain.com/*`
   - Add API restrictions (Maps JavaScript API only)

### 3. Deploy Storage Rules

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login:
   ```bash
   firebase login
   ```

3. Initialize:
   ```bash
   cd /path/to/HiveFive
   firebase init storage
   ```

4. Deploy rules:
   ```bash
   firebase deploy --only storage
   ```

Or manually:
1. Go to Firebase Console → Storage → Rules
2. Copy rules from `firebase-storage.rules`
3. Paste and click "Publish"

### 4. Update CORS Configuration

If using Firebase Storage directly, update CORS:

1. Create `cors.json`:
   ```json
   [
     {
       "origin": ["https://yourdomain.com", "https://www.yourdomain.com"],
       "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Authorization"]
     }
   ]
   ```

2. Apply CORS:
   ```bash
   gsutil cors set cors.json gs://your-bucket-name
   ```

## Google Cloud Setup

### 1. Update OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Go to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URI:
   - `https://your-backend-url.com/api/calendar/callback`

### 2. Update API Key Restrictions

- Add production domain to HTTP referrer restrictions
- Restrict APIs to only what's needed

### 3. Vertex AI Setup

1. Ensure Vertex AI API is enabled
2. Verify service account has proper permissions
3. Update `VERTEX_AI_PROJECT_ID` and `VERTEX_AI_LOCATION` in backend env

## Domain Configuration

### 1. Frontend Domain

- **Vercel/Netlify**: Add custom domain in dashboard
- **AWS Amplify**: Configure custom domain in console
- Update DNS records as instructed

### 2. Backend Domain

- **Railway/Render**: Use provided URL or add custom domain
- **Heroku**: Use `your-app.herokuapp.com` or add custom domain
- **VPS**: Configure Nginx with your domain

### 3. Update CORS

Update backend CORS configuration:

```javascript
app.use(cors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'http://localhost:3000' // Keep for local development
  ],
  credentials: true
}));
```

## Post-Deployment Checklist

### Frontend
- [ ] Environment variables set in deployment platform
- [ ] Build succeeds without errors
- [ ] Frontend loads correctly
- [ ] Firebase authentication works
- [ ] Google Maps loads
- [ ] API calls work (check browser console)
- [ ] Custom domain configured (if applicable)
- [ ] HTTPS enabled

### Backend
- [ ] Environment variables set
- [ ] MongoDB connection works
- [ ] Firebase Admin SDK configured
- [ ] API endpoints respond correctly
- [ ] CORS configured for production domain
- [ ] Health check endpoint works: `https://your-backend.com/api/health`
- [ ] Authentication works
- [ ] Custom domain configured (if applicable)
- [ ] HTTPS enabled

### Firebase
- [ ] Authorized domains updated
- [ ] Storage rules deployed
- [ ] API keys restricted to production domains
- [ ] CORS configured for storage

### Google Cloud
- [ ] OAuth redirect URIs updated
- [ ] API key restrictions updated
- [ ] Service account has proper permissions

### Testing
- [ ] User can sign in
- [ ] User can create profile
- [ ] User can create hive
- [ ] User can create event
- [ ] User can swipe on events
- [ ] User can upload media
- [ ] User can edit profile
- [ ] User can leave hive
- [ ] Google Calendar sync works (if implemented)

## Monitoring & Maintenance

### 1. Error Tracking

- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor backend logs
- Monitor frontend errors in browser console

### 2. Performance Monitoring

- Use Firebase Performance Monitoring
- Monitor API response times
- Monitor database query performance

### 3. Backup

- MongoDB Atlas has automatic backups (enable in cluster settings)
- Regularly backup Firebase Storage data
- Keep environment variables documented securely

### 4. Updates

- Keep dependencies updated
- Monitor security advisories
- Test updates in staging environment first

## Troubleshooting

### Frontend Issues

**Build fails**:
- Check environment variables are set
- Check for TypeScript/ESLint errors
- Check node version compatibility

**API calls fail**:
- Check `VITE_API_BASE_URL` is correct
- Check CORS configuration on backend
- Check browser console for errors

**Firebase errors**:
- Check authorized domains
- Check API key restrictions
- Check Firebase project ID matches

### Backend Issues

**Server won't start**:
- Check all environment variables are set
- Check MongoDB connection string
- Check Firebase Admin SDK path/credentials
- Check port is available

**Database connection fails**:
- Check MongoDB Atlas IP whitelist
- Check connection string format
- Check database user credentials

**Authentication fails**:
- Check Firebase Admin SDK credentials
- Check token verification
- Check CORS configuration

## Security Best Practices

1. **Environment Variables**:
   - Never commit `.env` files
   - Use secure storage for secrets
   - Rotate keys regularly

2. **API Keys**:
   - Restrict API keys to specific domains
   - Use API restrictions in Google Cloud
   - Monitor API usage

3. **Database**:
   - Use strong passwords
   - Restrict IP access
   - Enable encryption at rest

4. **Firebase**:
   - Deploy security rules
   - Restrict storage access
   - Monitor authentication attempts

5. **HTTPS**:
   - Always use HTTPS in production
   - Use SSL certificates (Let's Encrypt for free)

## Quick Deploy Commands

### Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

### Railway (Backend)
```bash
# Push to GitHub, Railway auto-deploys
git push origin main
```

### Manual Deploy
```bash
# Frontend
cd frontend
npm run build
# Upload dist/ folder to hosting

# Backend
cd backend
npm install --production
pm2 start src/server.js
```

## Support

For issues:
1. Check logs (backend console, browser console)
2. Check environment variables
3. Check API/documentation
4. Review error messages
5. Check this deployment guide

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Cloud Documentation](https://cloud.google.com/docs)

