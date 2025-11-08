# Firebase Setup Guide for HiveFive

This guide will help you configure Firebase Authentication and Storage for HiveFive.

## Step 1: Enable Google Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/project/hivefive-4384c/authentication/users)
2. Click on **Authentication** in the left sidebar
3. Click on **Get Started** (if you haven't enabled it yet)
4. Click on the **Sign-in method** tab
5. Click on **Google** from the list of providers
6. Toggle **Enable** to ON
7. Fill in the following:
   - **Project support email**: Your email address
   - **Project public-facing name**: HiveFive (or your preferred name)
8. Click **Save**

### Configure Authorized Domains

1. Still in the **Sign-in method** tab
2. Scroll down to **Authorized domains**
3. Click **Add domain**
4. Add the following domains:
   - `localhost` (for local development)
   - Your production domain (when deploying)
5. Click **Done**

## Step 2: Set Up Firebase Storage

1. Go to [Firebase Console > Storage](https://console.firebase.google.com/project/hivefive-4384c/storage)
2. Click **Get Started**
3. Choose **Start in production mode** (we'll set custom rules)
4. Select a storage location (choose one close to your users, e.g., `us-central1`)
5. Click **Done**

### Configure Storage Security Rules

1. In the Storage section, click on the **Rules** tab
2. Replace the default rules with the contents of `firebase-storage.rules` from this project
3. Click **Publish**

Alternatively, you can copy and paste these rules:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Profile photos - users can only upload/update their own profile photo
    match /profile-photos/{userId}/{fileName} {
      // Allow read access to all authenticated users
      allow read: if request.auth != null;
      
      // Allow write access only to the user themselves
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024 // 5MB limit
                   && request.resource.contentType.matches('image/.*');
      
      // Allow delete only by the user themselves
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Hive media - users can upload to hives they belong to
    match /hive-media/{hiveId}/{fileName} {
      // Allow read access to all authenticated users
      allow read: if request.auth != null;
      
      // Allow write access to authenticated users (hive membership checked in backend)
      allow write: if request.auth != null
                   && request.resource.size < 50 * 1024 * 1024 // 50MB limit for videos
                   && (request.resource.contentType.matches('image/.*') || 
                       request.resource.contentType.matches('video/.*'));
      
      // Allow delete only by uploader (checked in backend)
      allow delete: if request.auth != null;
    }
    
    // Default deny all other paths
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Step 3: Set Up Firebase Admin SDK (for Backend)

1. Go to [Firebase Console > Project Settings](https://console.firebase.google.com/project/hivefive-4384c/settings/general)
2. Click on the **Service Accounts** tab
3. Click **Generate New Private Key**
4. Click **Generate Key** in the confirmation dialog
5. Save the JSON file securely (e.g., as `firebase-admin-sdk.json`)
6. **IMPORTANT**: Add this file to `.gitignore` (already included)
7. Update your `backend/.env` file:
   ```env
   FIREBASE_ADMIN_SDK_PATH=./firebase-admin-sdk.json
   ```

## Step 4: Configure Firebase Storage CORS (Optional)

If you encounter CORS issues when uploading files, you may need to configure CORS for your Storage bucket.

1. Install Google Cloud SDK (if not already installed)
2. Create a `cors.json` file:
```json
[
  {
    "origin": ["http://localhost:3000", "http://localhost:5000"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization"]
  }
]
```

3. Run this command (replace `hivefive-4384c.firebasestorage.app` with your bucket name):
```bash
gsutil cors set cors.json gs://hivefive-4384c.firebasestorage.app
```

## Step 5: Test Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. Click "Sign in with Georgia Tech"
4. You should be redirected to Google sign-in
5. After signing in, you should be redirected back to the app

## Step 6: Test File Upload

1. After signing in, go to the profile creation page
2. Try uploading a profile photo
3. Check the Firebase Console > Storage to verify the file was uploaded

## Security Considerations

### Authentication
- ✅ Google Sign-In is enabled
- ✅ Domain restriction is configured in the code (`gatech.edu`)
- ✅ Only authenticated users can access the app

### Storage
- ✅ Profile photos are limited to 5MB
- ✅ Hive media is limited to 50MB
- ✅ Only authenticated users can upload files
- ✅ Users can only upload/delete their own profile photos
- ✅ File types are restricted to images and videos

### Backend Validation
- The backend should also validate:
  - User authentication
  - Hive membership before allowing media uploads
  - File size and type
  - User permissions

## Troubleshooting

### "Firebase: Error (auth/popup-closed-by-user)"
- The user closed the sign-in popup. This is normal behavior.

### "Firebase: Error (auth/unauthorized-domain)"
- Make sure `localhost` is added to authorized domains in Firebase Console.

### "Storage: User does not have permission to access this object"
- Check that the Storage rules are published correctly.
- Verify the user is authenticated.
- Check that the file path matches the rules (e.g., `profile-photos/{userId}/...`).

### "CORS error" when uploading files
- Configure CORS as described in Step 4.
- Make sure your Firebase Storage bucket name is correct.

### Firebase Admin SDK not working
- Verify the service account JSON file path is correct.
- Check that the file has proper permissions.
- Ensure the file is not committed to git (check `.gitignore`).

## Next Steps

1. **Enable Firebase Analytics** (optional):
   - Already configured in the code
   - Analytics will start collecting data automatically

2. **Set up Firebase App Check** (for production):
   - Go to Firebase Console > App Check
   - Enable App Check for your app
   - This helps protect your backend resources from abuse

3. **Configure Firebase Hosting** (optional):
   - For deploying the frontend to Firebase Hosting
   - Run `firebase init hosting`
   - Follow the setup wizard

## Production Checklist

Before deploying to production:

- [ ] Update authorized domains with production domain
- [ ] Review and tighten Storage security rules
- [ ] Set up Firebase App Check
- [ ] Configure custom domain (if using Firebase Hosting)
- [ ] Set up monitoring and alerts
- [ ] Review Firebase usage quotas and limits
- [ ] Set up backup for Firebase data (if using Firestore)
- [ ] Configure Firebase Storage lifecycle rules (auto-delete old files)
- [ ] Test authentication flow in production environment
- [ ] Test file upload/download in production environment

## Support

If you encounter any issues:
1. Check the Firebase Console for error logs
2. Check browser console for client-side errors
3. Check backend logs for server-side errors
4. Review Firebase documentation: https://firebase.google.com/docs

