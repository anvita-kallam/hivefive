import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';

function ReactionRecorder({ onReactionRecorded, eventId, swipeDirection = null }) {
  const [swipeDir, setSwipeDir] = useState(swipeDirection);
  const [isRecording, setIsRecording] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [emotion, setEmotion] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const recordingRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const emotionIntervalRef = useRef(null);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Load models from local /models folder
        const MODEL_URL = '/models';
        console.log('Loading face-api models from:', MODEL_URL);
        
        // Load models sequentially to better handle errors
        try {
          await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
          console.log('✓ Tiny face detector loaded');
        } catch (e) {
          console.error('Failed to load tinyFaceDetector:', e);
          throw e;
        }
        
        try {
          await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
          console.log('✓ Face landmarks loaded');
        } catch (e) {
          console.error('Failed to load faceLandmark68Net:', e);
          throw e;
        }
        
        try {
          await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
          console.log('✓ Face recognition loaded');
        } catch (e) {
          console.error('Failed to load faceRecognitionNet:', e);
          throw e;
        }
        
        try {
          await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
          console.log('✓ Face expressions loaded');
        } catch (e) {
          console.error('Failed to load faceExpressionNet:', e);
          throw e;
        }
        
        console.log('✅ All face-api models loaded successfully');
        setModelsLoaded(true);
      } catch (localError) {
        console.error('Error loading face-api models from local:', localError);
        console.error('Error details:', {
          message: localError.message,
          stack: localError.stack
        });
        
        // Try unpkg CDN as fallback (more reliable)
        try {
          console.warn('Trying unpkg CDN fallback...');
          const CDN_URL = 'https://unpkg.com/face-api.js@0.22.2/weights';
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(CDN_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(CDN_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(CDN_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(CDN_URL)
          ]);
          console.log('✅ Face-api models loaded from unpkg CDN');
          setModelsLoaded(true);
        } catch (cdnError) {
          console.error('Error loading face-api models from CDN:', cdnError);
          console.warn('⚠️ Continuing without emotion detection - recording will still work');
          // Allow component to continue even if models fail (users can still record)
          setModelsLoaded(false);
          // Don't set error - allow recording without emotion detection
        }
      }
    };

    loadModels();

    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (emotionIntervalRef.current) {
        clearInterval(emotionIntervalRef.current);
      }
    };
  }, []);

  // Start camera and recording
  const startRecording = async () => {
    try {
      setError(null);
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Start emotion detection (if models are loaded)
      if (modelsLoaded && canvasRef.current && videoRef.current) {
        detectEmotions();
        emotionIntervalRef.current = setInterval(detectEmotions, 500); // Check every 500ms
      } else {
        console.warn('Models not loaded, recording without emotion detection');
      }

      // Start video recording
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        
        // Convert to file
        const file = new File([blob], `reaction-${Date.now()}.webm`, { type: 'video/webm' });
        
        // Get the final emotion detection (if models are loaded)
        let finalEmotion = null;
        if (modelsLoaded) {
          finalEmotion = await detectEmotionsOnce();
        }
        
        // Call callback with reaction data (emotion may be null if models aren't loaded)
        if (onReactionRecorded) {
          onReactionRecorded({
            file,
            emotion: finalEmotion,
            swipeDirection: swipeDir
          });
        }

        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      recordingRef.current = true;

      // Auto-stop after 3 seconds (enough for a reaction)
      setTimeout(() => {
        if (recordingRef.current) {
          stopRecording();
        }
      }, 3000);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access camera. Please allow camera access and try again.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingRef.current) {
      recordingRef.current = false;
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (emotionIntervalRef.current) {
        clearInterval(emotionIntervalRef.current);
      }
    }
  };

  // Detect emotions from video frame
  const detectEmotions = async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas size to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Detect faces and expressions
      const detection = await faceapi
        .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detection) {
        const expressions = detection.expressions;
        
        // Get the dominant emotion
        const dominantEmotion = Object.keys(expressions).reduce((a, b) => 
          expressions[a] > expressions[b] ? a : b
        );

        // Calculate sentiment score (-1 to 1)
        // Positive emotions: happy, surprised
        // Negative emotions: sad, angry, fearful, disgusted
        // Neutral: neutral
        let sentiment = 0;
        if (dominantEmotion === 'happy') sentiment = 0.8;
        else if (dominantEmotion === 'surprised') sentiment = 0.6;
        else if (dominantEmotion === 'neutral') sentiment = 0;
        else if (dominantEmotion === 'sad') sentiment = -0.6;
        else if (dominantEmotion === 'angry') sentiment = -0.8;
        else if (dominantEmotion === 'fearful') sentiment = -0.7;
        else if (dominantEmotion === 'disgusted') sentiment = -0.5;

        setEmotion({
          dominant: dominantEmotion,
          expressions,
          sentiment,
          confidence: expressions[dominantEmotion]
        });
      }
    } catch (err) {
      console.error('Error detecting emotions:', err);
    }
  };

  // Detect emotions once (for final capture)
  const detectEmotionsOnce = async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return null;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const detection = await faceapi
        .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detection) {
        const expressions = detection.expressions;
        const dominantEmotion = Object.keys(expressions).reduce((a, b) => 
          expressions[a] > expressions[b] ? a : b
        );

        let sentiment = 0;
        if (dominantEmotion === 'happy') sentiment = 0.8;
        else if (dominantEmotion === 'surprised') sentiment = 0.6;
        else if (dominantEmotion === 'neutral') sentiment = 0;
        else if (dominantEmotion === 'sad') sentiment = -0.6;
        else if (dominantEmotion === 'angry') sentiment = -0.8;
        else if (dominantEmotion === 'fearful') sentiment = -0.7;
        else if (dominantEmotion === 'disgusted') sentiment = -0.5;

        return {
          dominant: dominantEmotion,
          expressions,
          sentiment,
          confidence: expressions[dominantEmotion]
        };
      }
    } catch (err) {
      console.error('Error detecting emotions:', err);
    }
    
    return null;
  };

  // Update swipe direction when prop changes
  useEffect(() => {
    if (swipeDirection) {
      setSwipeDir(swipeDirection);
      // Start recording when swipe direction is set and models are loaded
      if (modelsLoaded && !isRecording && !recordingRef.current) {
        startRecording();
      }
    }
  }, [swipeDirection, modelsLoaded]);

  if (error) {
    return (
      <div className="text-red-500 text-sm p-4">
        {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-2 underline"
        >
          Reload
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Video preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover rounded-lg"
        style={{ transform: 'scaleX(-1)' }} // Mirror effect
      />

      {/* Hidden canvas for face detection */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {/* Emotion overlay */}
      {emotion && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
          <div className="text-sm font-medium capitalize">
            {emotion.dominant} ({Math.round(emotion.confidence * 100)}%)
          </div>
          <div className="text-xs">
            Sentiment: {emotion.sentiment > 0 ? '😊' : emotion.sentiment < 0 ? '😢' : '😐'}
          </div>
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Recording
        </div>
      )}

      {/* Instructions */}
      {!isRecording && modelsLoaded && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm text-center">
          Show your reaction! 📸
        </div>
      )}
    </div>
  );
}

export default ReactionRecorder;

