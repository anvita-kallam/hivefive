# Deploy Firebase Storage Rules

## Quick Fix for 403 Upload Errors

The 403 error when uploading files is because Firebase Storage rules need to be deployed to your Firebase project.

## Steps to Deploy Storage Rules

### Option 1: Firebase Console (Easiest)

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com/project/hivefive-477603/storage/rules

2. **Click "Edit rules"** button

3. **Copy and paste these rules:**

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

4. **Click "Publish"** button

5. **Wait a few seconds** for rules to deploy

6. **Try uploading again** - it should work!

### Option 2: Firebase CLI

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project:**
   ```bash
   cd /Users/anvitakallam/Documents/HiveFive
   firebase init storage
   ```
   - Select project: `hivefive-477603`
   - Use existing rules file: `firebase-storage.rules`

4. **Deploy rules:**
   ```bash
   firebase deploy --only storage
   ```

## Verify Rules Are Deployed

1. Go to: https://console.firebase.google.com/project/hivefive-477603/storage/rules
2. You should see the rules you just deployed
3. The rules should be active immediately

## What These Rules Allow

- **Profile Photos**: Users can upload/read their own profile photos (max 5MB, images only)
- **Hive Media**: Any authenticated user can upload to hive-media paths (max 50MB, images/videos)
- **Default**: All other paths are denied

## Troubleshooting

### Still Getting 403 After Deploying?

1. **Check browser console** - Look for detailed error logs
2. **Verify you're signed in** - Check Firebase Auth in browser console
3. **Check file type** - Must be image/* or video/*
4. **Check file size** - Must be under limits (5MB for photos, 50MB for videos)
5. **Clear browser cache** - Sometimes cached rules cause issues

### Error: "Rules are using an invalid version"

- Make sure you're using `rules_version = '2';` at the top
- This is the current version for Firebase Storage rules

