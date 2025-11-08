# Face-API.js Models

The face-api.js models are loaded from a CDN by default. If you want to use local models for better performance or offline use, download them from:

**Option 1: Use CDN (Recommended)**
The ReactionRecorder component automatically loads models from jsdelivr CDN. No action needed.

**Option 2: Download Local Models**
1. Download the models from: https://github.com/justadudewhohacks/face-api.js-models
2. Place the following files in this directory (`/public/models/`):
   - `tiny_face_detector_model-weights_manifest.json`
   - `tiny_face_detector_model-shard1`
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`
   - `face_recognition_model-weights_manifest.json`
   - `face_recognition_model-shard1`
   - `face_expression_model-weights_manifest.json`
   - `face_expression_model-shard1`

**Quick Download Script:**
```bash
cd frontend/public/models
# Download from jsdelivr CDN
curl -L "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/tiny_face_detector_model-weights_manifest.json" -o tiny_face_detector_model-weights_manifest.json
curl -L "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/tiny_face_detector_model-shard1" -o tiny_face_detector_model-shard1
curl -L "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_landmark_68_model-weights_manifest.json" -o face_landmark_68_model-weights_manifest.json
curl -L "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_landmark_68_model-shard1" -o face_landmark_68_model-shard1
curl -L "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_recognition_model-weights_manifest.json" -o face_recognition_model-weights_manifest.json
curl -L "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_recognition_model-shard1" -o face_recognition_model-shard1
curl -L "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_expression_model-weights_manifest.json" -o face_expression_model-weights_manifest.json
curl -L "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_expression_model-shard1" -o face_expression_model-shard1
```

**Note:** The component will work without local models - it will use the CDN automatically. Local models are optional and only needed for offline use or better performance.

