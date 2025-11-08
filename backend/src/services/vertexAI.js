import { ImageAnnotatorClient } from '@google-cloud/vision';
import dotenv from 'dotenv';

dotenv.config();

let visionClient = null;

// Initialize Vision client
try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    visionClient = new ImageAnnotatorClient({
      projectId: process.env.VERTEX_AI_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
    console.log('Vertex AI Vision client initialized');
  } else {
    visionClient = new ImageAnnotatorClient({
      projectId: process.env.VERTEX_AI_PROJECT_ID
    });
  }
} catch (error) {
  console.warn('Vertex AI Vision client initialization failed:', error.message);
  console.warn('Media sentiment analysis will be disabled or use mock data');
}

/**
 * Analyze media for facial expressions and sentiment
 */
export async function analyzeMediaSentiment(fileURL, fileType) {
  if (!visionClient) {
    console.warn('Vision client not initialized, returning mock sentiment');
    return {
      overallSentiment: 0.7,
      emotions: ['happy', 'excited'],
      confidence: 0.8
    };
  }

  try {
    // For production, you would download the file from Firebase Storage
    // For now, we'll use a simplified analysis
    // Note: The Vision API requires the image to be accessible via URL or as bytes
    
    if (fileType === 'image' || fileType === 'livephoto') {
      // For URLs, use imageUri. For local files, use image with bytes
      const [result] = await visionClient.faceDetection({
        image: { source: { imageUri: fileURL } }
      });

      const faces = result.faceAnnotations || [];
      
      if (faces.length === 0) {
        return {
          overallSentiment: 0.5,
          emotions: [],
          confidence: 0.5,
          faceCount: 0
        };
      }

      // Analyze facial expressions
      const emotions = [];
      let joyScore = 0;
      let sorrowScore = 0;
      let angerScore = 0;
      let surpriseScore = 0;

      faces.forEach(face => {
        if (face.joyLikelihood && ['VERY_LIKELY', 'LIKELY'].includes(face.joyLikelihood)) {
          emotions.push('happy');
          joyScore += 0.8;
        }
        if (face.sorrowLikelihood && ['VERY_LIKELY', 'LIKELY'].includes(face.sorrowLikelihood)) {
          emotions.push('sad');
          sorrowScore += 0.8;
        }
        if (face.angerLikelihood && ['VERY_LIKELY', 'LIKELY'].includes(face.angerLikelihood)) {
          emotions.push('angry');
          angerScore += 0.8;
        }
        if (face.surpriseLikelihood && ['VERY_LIKELY', 'LIKELY'].includes(face.surpriseLikelihood)) {
          emotions.push('surprised');
          surpriseScore += 0.8;
        }
      });

      // Calculate overall sentiment (0-1 scale, where 1 is most positive)
      const overallSentiment = Math.max(0, Math.min(1, 
        (joyScore - sorrowScore - angerScore * 0.5 + surpriseScore * 0.3) / faces.length + 0.5
      ));

      return {
        overallSentiment,
        emotions: [...new Set(emotions)],
        confidence: 0.8,
        faceCount: faces.length
      };
    } else if (fileType === 'video') {
      // Video analysis would require Video Intelligence API
      // For now, return placeholder
      return {
        overallSentiment: 0.6,
        emotions: [],
        confidence: 0.5,
        note: 'Video analysis not yet implemented'
      };
    }

    return null;
  } catch (error) {
    console.error('Error analyzing media sentiment:', error);
    // Return neutral sentiment on error
    return {
      overallSentiment: 0.5,
      emotions: [],
      confidence: 0.3,
      error: error.message
    };
  }
}

/**
 * Generate text embeddings for vector search (for future use)
 */
export async function generateEmbedding(text) {
  // This would use Vertex AI's text embedding model
  // Placeholder for now
  return null;
}
