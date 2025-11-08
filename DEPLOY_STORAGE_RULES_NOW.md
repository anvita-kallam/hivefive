# 🚨 Deploy Firebase Storage Rules NOW

## Quick Fix for Upload Permission Error

The error you're seeing is because the Firebase Storage rules need to be **deployed** to Firebase. The rules file has been updated, but you need to deploy it to Firebase Console.

## Option 1: Firebase Console (Easiest - 2 minutes)

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com/project/hivefive-477603/storage/rules

2. **Click "Edit rules"** button at the top

3. **Copy and paste ALL of this:**

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
    // Support both flat structure (hive-media/{hiveId}/{fileName}) and nested structure (hive-media/{hiveId}/{eventId}/{fileName})
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
    
    // Hive media with event ID (nested structure) - users can upload to event galleries
    match /hive-media/{hiveId}/{eventId}/{fileName} {
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
    
    // Reaction videos - users can upload reactions to events
    match /reactions/{hiveId}/{eventId}/{fileName} {
      // Allow read access to all authenticated users
      allow read: if request.auth != null;
      
      // Allow write access to authenticated users (hive membership checked in backend)
      // Made content type check more lenient to handle various video formats
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024 // 10MB limit for reaction videos
                   && (request.resource.contentType.matches('video/.*') || 
                       request.resource.contentType == 'video/webm' ||
                       request.resource.contentType == 'video/mp4' ||
                       request.resource.contentType == 'video/quicktime');
      
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

5. **Wait 5-10 seconds** for rules to deploy

6. **Try uploading again** - it should work now! ✅

## Option 2: Firebase CLI (If you have it set up)

```bash
cd /Users/anvitakallam/Documents/HiveFive
firebase deploy --only storage
```

## What Changed?

The rules now support **nested paths** for event media:
- ✅ `hive-media/{hiveId}/{fileName}` - Original structure (still works)
- ✅ `hive-media/{hiveId}/{eventId}/{fileName}` - NEW: Nested structure for event galleries

This allows uploads to event-specific galleries like:
- `hive-media/690ed06183e1b0db047a9ad4/690fc30060ae5d09a3937146/file.png`

## Verify It Worked

1. After deploying, go back to your app
2. Try uploading a file to an event
3. It should work without the 403 error!

## Still Having Issues?

1. **Clear browser cache** - Sometimes cached rules cause issues
2. **Check you're signed in** - Rules require authentication
3. **Check file type** - Must be image/* or video/*
4. **Check file size** - Must be under 50MB for hive media

