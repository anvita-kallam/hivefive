import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as faceapi from 'face-api.js';

const ReactionRecorder = forwardRef(({ 
  onReactionRecorded, 
  eventId, 
  swipeDirection = null,
  showVideo = false,
  overlayContent = null
}, ref) => {
  const [swipeDir, setSwipeDir] = useState(swipeDirection);
  const [isRecording, setIsRecording] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [emotion, setEmotion] = useState(null);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const recordingRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const emotionIntervalRef = useRef(null);
  const stopRecordingTimeoutRef = useRef(null);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    startRecording: async () => {
      if (!recordingRef.current) {
        await startRecording();
      }
    },
    stopRecording: (direction) => {
      if (recordingRef.current) {
        stopRecordingManually(direction);
      }
    },
    isRecording: () => recordingRef.current
  }));

  // Auto-start recording when models are loaded (for full screen mode)
  useEffect(() => {
    let mounted = true;
    
    const autoStart = async () => {
      if (modelsLoaded && !streamRef.current && !recordingRef.current && mounted) {
        try {
          // Start camera first
          await startCamera();
          // Wait for camera to be ready
          await new Promise(resolve => setTimeout(resolve, 500));
          // Start recording if still mounted and not already recording
          if (mounted && !recordingRef.current) {
            await startRecording();
          }
        } catch (error) {
          console.error('Error auto-starting recording:', error);
        }
      }
    };

    autoStart();

    return () => {
      mounted = false;
    };
  }, [modelsLoaded]);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      const CDN_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
      
      try {
        console.log('Loading face-api models from jsdelivr CDN...');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(CDN_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(CDN_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(CDN_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(CDN_URL)
        ]);
        console.log('✅ All face-api models loaded successfully from CDN');
        setModelsLoaded(true);
      } catch (cdnError) {
        console.error('Error loading face-api models from CDN:', cdnError);
        
        try {
          console.warn('Trying local models folder...');
          const MODEL_URL = '/models';
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
          ]);
          console.log('✅ All face-api models loaded from local');
          setModelsLoaded(true);
        } catch (localError) {
          console.error('Error loading face-api models from local:', localError);
          console.warn('⚠️ Continuing without emotion detection - recording will still work');
          setModelsLoaded(false);
        }
      }
    };

    loadModels();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (emotionIntervalRef.current) {
        clearInterval(emotionIntervalRef.current);
      }
      if (stopRecordingTimeoutRef.current) {
        clearTimeout(stopRecordingTimeoutRef.current);
      }
    };
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      setError(null);
      
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
        setIsReady(true);
      }

      // Start emotion detection (if models are loaded)
      if (modelsLoaded && canvasRef.current && videoRef.current) {
        detectEmotions();
        emotionIntervalRef.current = setInterval(detectEmotions, 500);
      }
    } catch (err) {
      console.error('Error starting camera:', err);
      setError('Failed to access camera. Please allow camera access and try again.');
    }
  };

  // Start recording
  const startRecording = async () => {
    if (isRecording || recordingRef.current) {
      console.log('Already recording, skipping start');
      return;
    }

    try {
      // If camera isn't started, start it first
      if (!streamRef.current || !isReady) {
        await startCamera();
        // Wait a bit for camera to be ready
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      if (!streamRef.current) {
        throw new Error('Camera stream not available');
      }

      // Start video recording
      // Try different MIME types for better browser compatibility
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: mimeType
      });

      chunksRef.current = [];
      
      // Set up data handler
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
          console.log('Video chunk received:', { size: e.data.size, totalChunks: chunksRef.current.length });
        }
      };

      // Set up stop handler
      mediaRecorder.onstop = async () => {
        console.log('Recording stopped. Processing data...', {
          chunks: chunksRef.current.length,
          totalSize: chunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0)
        });
        
        // Make sure we have video data
        if (chunksRef.current.length === 0) {
          console.warn('No video chunks recorded');
          // Cleanup and return
          cleanup();
          return;
        }

        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        console.log('Video blob created:', { size: blob.size, type: blob.type });
        
        const file = new File([blob], `reaction-${Date.now()}.webm`, { type: 'video/webm' });
        
        // Get final emotion
        let finalEmotion = null;
        try {
          if (modelsLoaded) {
            finalEmotion = await detectEmotionsOnce();
          } else if (emotion) {
            finalEmotion = emotion;
          }
        } catch (error) {
          console.warn('Error detecting final emotion:', error);
          if (emotion) {
            finalEmotion = emotion;
          }
        }
        
        // Call callback
        if (onReactionRecorded) {
          console.log('Calling onReactionRecorded with:', {
            fileSize: file.size,
            hasEmotion: !!finalEmotion,
            swipeDirection: swipeDir || swipeDirection
          });
          onReactionRecorded({
            file,
            emotion: finalEmotion,
            swipeDirection: swipeDir || swipeDirection
          });
        }

        // Cleanup
        cleanup();
      };
      
      const cleanup = () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        chunksRef.current = [];
        setIsRecording(false);
        recordingRef.current = false;
        setIsReady(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      
      // Start recording with timeslices to get data periodically
      // This ensures we capture frames even if recording stops abruptly
      mediaRecorder.start(100); // Request data every 100ms
      setIsRecording(true);
      recordingRef.current = true;
      console.log('✅ Recording started', {
        state: mediaRecorder.state,
        mimeType: mediaRecorder.mimeType,
        streamActive: streamRef.current.active
      });

      // Auto-stop after 30 seconds max (safety timeout)
      stopRecordingTimeoutRef.current = setTimeout(() => {
        if (recordingRef.current) {
          console.log('⏱️ Auto-stopping recording after 30 seconds (timeout)');
          stopRecording();
        }
      }, 30000);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please try again.');
    }
  };

  // Stop recording manually (called when swipe completes)
  const stopRecordingManually = (direction) => {
    if (stopRecordingTimeoutRef.current) {
      clearTimeout(stopRecordingTimeoutRef.current);
    }
    setSwipeDir(direction);
    stopRecording();
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log('🛑 Stopping recording...');
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
    if (!videoRef.current || !canvasRef.current || !modelsLoaded || !videoRef.current.readyState) return;

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
    }
  }, [swipeDirection]);

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
      {/* Video preview (hidden if showVideo is false) */}
      {showVideo && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-lg"
            style={{ transform: 'scaleX(-1)' }}
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
        </>
      )}
      
      {/* Hidden video and canvas for recording even if not showing video */}
      {!showVideo && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="hidden"
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
        </>
      )}

      {/* Overlay content (the swipe card) */}
      {overlayContent && (
        <div className="absolute inset-0 z-20 pointer-events-auto">
          {overlayContent}
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 z-30">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Recording
        </div>
      )}

      {/* Emotion indicator */}
      {emotion && showVideo && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm z-30">
          {emotion.dominant === 'happy' ? '😊 Happy' :
           emotion.dominant === 'sad' ? '😢 Sad' :
           emotion.dominant === 'angry' ? '😠 Angry' :
           emotion.dominant === 'surprised' ? '😲 Surprised' :
           emotion.dominant === 'fearful' ? '😨 Fearful' :
           emotion.dominant === 'disgusted' ? '🤢 Disgusted' : '😐 Neutral'}
        </div>
      )}

      {/* Status message */}
      {!isReady && modelsLoaded && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm z-30">
          Starting camera...
        </div>
      )}
    </div>
  );
});

ReactionRecorder.displayName = 'ReactionRecorder';

export default ReactionRecorder;
