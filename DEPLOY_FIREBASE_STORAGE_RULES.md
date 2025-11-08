# Deploy Firebase Storage Rules

The reaction video uploads are failing with a 403 error because the Firebase Storage security rules need to be deployed.

## Steps to Deploy Firebase Storage Rules

### Option 1: Using Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not already done):
   ```bash
   firebase init storage
   ```
   - Select your Firebase project: `hivefive-477603`
   - Select `firebase-storage.rules` as your rules file
   - Choose "Yes" when asked if you want to set up default file structure

4. **Deploy the rules**:
   ```bash
   firebase deploy --only storage
   ```

### Option 2: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `hivefive-477603`
3. Navigate to **Storage** in the left sidebar
4. Click on the **Rules** tab
5. Copy the contents of `firebase-storage.rules` file
6. Paste it into the rules editor
7. Click **Publish**

## Verify Rules Are Deployed

After deploying, test by:
1. Reacting to an event invite
2. The reaction video should upload successfully
3. Check the browser console for successful upload messages

## Current Rules Summary

The rules allow:
- ✅ Authenticated users to read reaction videos
- ✅ Authenticated users to upload reaction videos (< 10MB)
- ✅ Supports video/webm, video/mp4, and video/quicktime formats
- ✅ Authenticated users to delete their own reactions

## Troubleshooting

If you still get 403 errors after deploying:
1. Check that you're logged in (Firebase Auth)
2. Verify the file size is under 10MB
3. Check that the content type is a video format
4. Check Firebase Console → Storage → Rules to verify rules are deployed
5. Check browser console for detailed error messages

