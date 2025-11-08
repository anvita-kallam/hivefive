# 🔧 Fix CORS Error

## The Problem

You're seeing CORS errors like:
```
Access to XMLHttpRequest at 'https://hivefive-production.up.railway.app/api/hives' 
from origin 'https://hivefiveconnect.vercel.app' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

This means the backend is not allowing requests from the Vercel frontend.

## The Solution

### Step 1: Verify FRONTEND_URL in Railway

1. Go to [Railway Dashboard](https://railway.app/project/acb41216-873e-4eaf-9d91-6db083a27bca)
2. Select your backend service
3. Go to **Variables** tab
4. Check if `FRONTEND_URL` is set
5. If not set, add it:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://hivefiveconnect.vercel.app`
   - Click **Save**

### Step 2: Code Fix Applied

The backend code has been updated to include the Vercel frontend URL in allowed origins:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://hivefiveconnect.vercel.app',  // Added
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [])
];
```

### Step 3: Deploy the Fix

The code fix has been committed and pushed to GitHub. Railway will automatically redeploy.

If Railway doesn't auto-deploy:
1. Go to Railway Dashboard
2. Select your service
3. Go to **Deployments** tab
4. Click **Redeploy** if needed

### Step 4: Verify FRONTEND_URL Environment Variable

Make sure `FRONTEND_URL` is set in Railway:

1. Go to Railway Dashboard
2. Select your backend service
3. Go to **Variables** tab
4. Verify `FRONTEND_URL` = `https://hivefiveconnect.vercel.app`
5. If not set, add it:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://hivefiveconnect.vercel.app`
   - Click **Save**
6. Redeploy if you just added it

### Step 5: Test

After deployment completes:

1. Visit: https://hivefiveconnect.vercel.app
2. Open browser console (F12)
3. CORS errors should be gone
4. API calls should work
5. Try signing in

## Troubleshooting

### CORS Errors Still Appearing

1. **Check Railway Variables**:
   - Verify `FRONTEND_URL` is set correctly
   - Should be: `https://hivefiveconnect.vercel.app`
   - No trailing slash

2. **Check Backend Logs**:
   - Go to Railway Dashboard
   - Select your service
   - Check **Logs** tab
   - Look for CORS-related messages
   - Check if origin is being logged

3. **Verify Deployment**:
   - Check that the latest code is deployed
   - Look at deployment logs
   - Verify the CORS configuration is in the deployed code

4. **Check Frontend URL**:
   - Make sure frontend is actually at: `https://hivefiveconnect.vercel.app`
   - Check for typos in the URL
   - Verify it's the production URL, not preview URL

### Still Not Working?

1. **Check CORS Configuration**:
   - Verify backend/src/server.js has the correct origins
   - Check that `https://hivefiveconnect.vercel.app` is in the list
   - Verify FRONTEND_URL environment variable is set

2. **Check Browser Console**:
   - Look for the exact error message
   - Check which origin is being blocked
   - Verify the request URL

3. **Test Health Endpoint**:
   ```bash
   curl -H "Origin: https://hivefiveconnect.vercel.app" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://hivefive-production.up.railway.app/api/health
   ```
   Should return CORS headers.

4. **Check Railway Logs**:
   - Look for CORS-related error messages
   - Check if requests are reaching the backend
   - Verify the origin is being checked correctly

## Expected Behavior

After the fix:

- ✅ No CORS errors in browser console
- ✅ API calls work from Vercel frontend
- ✅ Authentication works
- ✅ All API endpoints accessible

## Verification Checklist

- [ ] `FRONTEND_URL` is set in Railway: `https://hivefiveconnect.vercel.app`
- [ ] Backend code is deployed (check Railway deployments)
- [ ] No CORS errors in browser console
- [ ] API calls work from frontend
- [ ] Authentication works
- [ ] Health endpoint responds: https://hivefive-production.up.railway.app/api/health

## Related Documentation

- See `DEPLOYMENT_NEXT_STEPS.md` for complete deployment checklist
- See `RAILWAY_SETUP.md` for Railway configuration
- See `DEPLOYMENT_ENV_VALUES.local.md` for environment variables

## Success!

Once CORS is fixed:

- ✅ Frontend can communicate with backend
- ✅ All API endpoints are accessible
- ✅ Authentication works
- ✅ App is fully functional

🎉 Your deployment should now be working!

