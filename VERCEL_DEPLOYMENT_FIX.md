# 🔧 Vercel Deployment Fix

## The Problem

Vercel was failing with:
```
sh: line 1: cd: frontend: No such file or directory
Error: Command "cd frontend && npm install" exited with 1
```

## The Solution

You need to set the **Root Directory** to `frontend` in Vercel's project settings.

## Step-by-Step Fix

### Option 1: Fix in Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Select your project

2. **Open Project Settings**:
   - Click on "Settings" tab
   - Click on "General" in the left sidebar

3. **Set Root Directory**:
   - Scroll down to "Root Directory"
   - Click "Edit"
   - Enter: `frontend`
   - Click "Save"

4. **Redeploy**:
   - Go to "Deployments" tab
   - Click on the latest deployment
   - Click "Redeploy" (or push a new commit)

### Option 2: Delete and Recreate Project

1. **Delete Current Project**:
   - Go to Project Settings
   - Scroll down to "Danger Zone"
   - Click "Delete Project"

2. **Create New Project**:
   - Click "New Project"
   - Import your GitHub repository
   - **BEFORE clicking Deploy**, click "Configure Project"
   - Set **Root Directory** to `frontend`
   - Framework: Vite (should auto-detect)
   - Build Command: `npm run build` (should auto-detect)
   - Output Directory: `dist` (should auto-detect)
   - Install Command: `npm install` (should auto-detect)

3. **Add Environment Variables**:
   - Add all your `VITE_*` environment variables
   - Add `VITE_API_BASE_URL` (set this after backend is deployed)

4. **Deploy**:
   - Click "Deploy"

## Verification

After setting the root directory, Vercel should:
- ✅ Find the `package.json` in the `frontend` directory
- ✅ Run `npm install` in the `frontend` directory
- ✅ Run `npm run build` in the `frontend` directory
- ✅ Find the `dist` folder in the `frontend` directory

## Configuration Files

There are two `vercel.json` files:

1. **Root `vercel.json`**: For reference (can be deleted)
2. **`frontend/vercel.json`**: Used when root directory is set to `frontend`

The `frontend/vercel.json` will be used automatically when Vercel builds from the `frontend` directory.

## Still Having Issues?

1. **Check Root Directory**:
   - Go to Settings → General
   - Verify Root Directory is set to `frontend`

2. **Check Build Logs**:
   - Go to Deployments
   - Click on a deployment
   - Check the build logs for errors

3. **Verify File Structure**:
   - Make sure `frontend/package.json` exists
   - Make sure `frontend/vite.config.js` exists
   - Make sure `frontend/src` directory exists

4. **Clear Cache**:
   - Go to Settings → General
   - Scroll to "Build & Development Settings"
   - Clear build cache

## Alternative: Use Vercel CLI

If the dashboard isn't working, you can use the CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow the prompts
# - Link to existing project or create new
# - Set root directory (should be . for current directory)
# - Add environment variables
```

## Next Steps

After successful deployment:

1. ✅ Update `VITE_API_BASE_URL` to your backend URL
2. ✅ Update Firebase authorized domains
3. ✅ Update Google Cloud API key restrictions
4. ✅ Test the deployment

