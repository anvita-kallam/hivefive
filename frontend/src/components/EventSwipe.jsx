import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';
import { format } from 'date-fns';
import { Calendar, MapPin, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactionRecorder from './ReactionRecorder';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { useAuthStore } from '../store/authStore';

function EventSwipe({ event, onSwiped, fullScreen = false }) {
  const [swiped, setSwiped] = useState(false);
  const [startTime] = useState(Date.now());
  const [isProcessing, setIsProcessing] = useState(false);
  const recorderRef = useRef(null);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const swipeMutation = useMutation({
    mutationFn: async ({ direction, responseTime, emotionData, reactionFile }) => {
      // If we have a reaction file, upload it (even if emotionData is null)
      let reactionMediaId = null;
      if (reactionFile) {
        try {
          console.log('📤 Starting video upload:', {
            fileName: reactionFile.name,
            fileSize: reactionFile.size,
            fileType: reactionFile.type
          });
          
          // Upload reaction video to Firebase Storage
          const { auth } = await import('../config/firebase');
          const currentUser = auth.currentUser;
          if (!currentUser) throw new Error('Not authenticated');

          // Get token (don't force refresh to avoid quota issues)
          // Use cached token if available, only refresh if needed
          let token;
          try {
            token = await currentUser.getIdToken(false);
          } catch (error) {
            if (error.code === 'auth/quota-exceeded') {
              console.warn('Firebase quota exceeded, trying cached token');
              // Try to get any available token
              token = await currentUser.getIdToken(false);
            } else {
              throw error;
            }
          }
          
          console.log('Uploading reaction video:', {
            uid: currentUser.uid,
            email: currentUser.email,
            fileName: reactionFile.name,
            fileType: reactionFile.type,
            fileSize: reactionFile.size,
            hasToken: !!token
          });

          const sanitizedFileName = reactionFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const fileRef = ref(storage, `reactions/${event.hiveID}/${event._id}/${Date.now()}_${sanitizedFileName}`);
          
          // Ensure content type is set correctly - Firebase Storage rules require video/*
          // Default to video/webm if type is not set or invalid
          let contentType = reactionFile.type || 'video/webm';
          if (!contentType.startsWith('video/')) {
            contentType = 'video/webm';
          }
          
          const metadata = {
            contentType: contentType,
            customMetadata: {
              uploadedBy: currentUser.uid,
              hiveId: event.hiveID,
              eventId: event._id,
              swipeDirection: direction,
              uploadedAt: new Date().toISOString()
            }
          };

          console.log('Uploading with metadata:', {
            path: `reactions/${event.hiveID}/${event._id}/${sanitizedFileName}`,
            contentType: contentType,
            size: reactionFile.size
          });

          await uploadBytes(fileRef, reactionFile, metadata);
          const fileURL = await getDownloadURL(fileRef);

          // Upload reaction metadata to backend (emotionData may be null if face detection failed)
          const mediaResponse = await api.post('/media', {
            eventID: event._id,
            fileURL,
            fileType: 'video',
            caption: `Reaction: ${direction === 'right' ? 'Accepted' : 'Declined'}`,
            facialSentiment: emotionData || null,
            isReaction: true,
            swipeDirection: direction
          });

          reactionMediaId = mediaResponse.data._id;
          console.log('✅ Reaction video uploaded successfully:', {
            mediaId: reactionMediaId,
            eventId: event._id,
            hiveId: event.hiveID,
            fileURL: fileURL,
            isReaction: true,
            emotionData: emotionData ? 'present' : 'missing'
          });
        } catch (error) {
          console.error('❌ Error uploading reaction:', error);
          console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
          // Continue with swipe even if reaction upload fails
        }
      }

      return api.post(`/events/${event._id}/swipe`, {
        swipeDirection: direction,
        responseTime,
        emotionData: emotionData || null,
        reactionMediaId: reactionMediaId || null,
        gpsData: null // TODO: Add GPS data
      });
    },
    onSuccess: (data) => {
      console.log('✅ Swipe successful, invalidating queries...');
      // Ensure swiped state is set
      setSwiped(true);
      // Invalidate all related queries to refresh data
      queryClient.invalidateQueries(['events']);
      queryClient.invalidateQueries(['allEvents']);
      queryClient.invalidateQueries(['hive', event.hiveID]);
      queryClient.invalidateQueries(['hives']);
      // Specifically invalidate media queries for this event
      queryClient.invalidateQueries(['media', event.hiveID, event._id]);
      queryClient.invalidateQueries(['media', event.hiveID]);
      queryClient.invalidateQueries(['media']);
      // Also invalidate the event query to get updated swipe logs
      queryClient.invalidateQueries(['event', event._id]);
      
      // Modal is already closed for full screen mode
      // Only call onSwiped for non-full screen mode
      if (!fullScreen && onSwiped) {
        setTimeout(() => {
          onSwiped();
        }, 500);
      }
    },
    onError: (error) => {
      console.error('❌ Swipe error (non-blocking):', error);
      // Don't show error to user - modal is already closed
      // Still invalidate queries to refresh data
      queryClient.invalidateQueries(['events']);
      queryClient.invalidateQueries(['allEvents']);
      queryClient.invalidateQueries(['hive', event.hiveID]);
      queryClient.invalidateQueries(['hives']);
    }
  });

  const handleReactionRecorded = (reaction) => {
    console.log('✅ Reaction recorded, file ready for upload:', {
      hasFile: !!reaction.file,
      fileSize: reaction.file?.size,
      fileType: reaction.file?.type,
      swipeDirection: reaction.swipeDirection,
      hasEmotion: !!reaction.emotion
    });
    
    // Validate that we have a file
    const reactionFile = (reaction.file && reaction.file.size > 0) ? reaction.file : null;
    const responseTime = Date.now() - startTime;
    
    // Submit swipe mutation - this will upload the video if available
    swipeMutation.mutate({
      direction: reaction.swipeDirection,
      responseTime,
      emotionData: reaction.emotion,
      reactionFile: reactionFile
    });
  };

  const handleButtonClick = async (direction) => {
    if (swiped || isProcessing) {
      console.log('⚠️ Already processing, ignoring');
      return;
    }
    
    // Mark as processing immediately
    setSwiped(true);
    setIsProcessing(true);
    
    // Close modal immediately
    if (fullScreen && onSwiped) {
      console.log('Closing modal immediately');
      onSwiped(event._id);
    }
    
    const swipeDirection = direction === 'right' ? 'right' : 'left';
    const responseTime = Date.now() - startTime;
    
    // If recording is active, stop it and wait for the video
    if (recorderRef.current && recorderRef.current.isRecording && recorderRef.current.isRecording()) {
      console.log('Stopping recording...');
      try {
        // Stop recording - this will call handleReactionRecorded when done
        recorderRef.current.stopRecording(swipeDirection);
        // handleReactionRecorded will handle the mutation
        return;
      } catch (error) {
        console.error('Error stopping recording:', error);
        // Continue without video if recording fails
      }
    }
    
    // No recording or recording failed, submit swipe without video
    console.log('Submitting swipe without video');
    swipeMutation.mutate({
      direction: swipeDirection,
      responseTime,
      emotionData: null,
      reactionFile: null
    });
  };

  // Don't render if already swiped (for non-full screen mode)
  if (swiped && !fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-80 h-96 honey-card rounded-2xl flex items-center justify-center"
      >
        <p className="text-[#2D1B00] font-medium text-xl">Thanks for your response!</p>
      </motion.div>
    );
  }

  // Full screen styles
  const containerClass = fullScreen
    ? "w-full h-full relative"
    : "w-80 h-96 relative";

  const cardClass = fullScreen
    ? "honey-swipe-card w-full h-full rounded-3xl shadow-2xl p-8 md:p-12 flex flex-col cursor-grab active:cursor-grabbing"
    : "honey-swipe-card w-full h-full rounded-2xl shadow-xl p-6 flex flex-col cursor-grab active:cursor-grabbing";

  const titleClass = fullScreen
    ? "text-4xl md:text-5xl font-medium text-[#2D1B00] mb-4"
    : "text-2xl font-medium text-[#2D1B00] mb-2";

  const descriptionClass = fullScreen
    ? "text-xl md:text-2xl text-[#6B4E00] mb-6"
    : "text-[#6B4E00]";

  // Render the swipe card content
  const swipeCardContent = (
    <motion.div
      className={`${cardClass} relative`}
      whileHover={fullScreen ? {} : { scale: 1.02 }}
      style={fullScreen ? { 
        backgroundColor: 'rgba(245, 230, 211, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      } : {}}
    >
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h3 className={titleClass}>{event.title}</h3>
            {event.description && (
              <p className={descriptionClass}>{event.description}</p>
            )}
          </div>

              {/* Proposed Times */}
              <div className="flex-1 space-y-4 md:space-y-6 mb-6 md:mb-8">
                <h4 className={`font-medium text-[#2D1B00] ${fullScreen ? 'text-2xl md:text-3xl' : ''}`}>
                  Proposed Times:
                </h4>
                <div className="space-y-3">
                  {event.proposedTimes && event.proposedTimes.map((time, index) => (
                    <div key={index} className={`flex items-center gap-3 text-[#6B4E00] ${fullScreen ? 'text-xl md:text-2xl' : ''}`}>
                      <Calendar className={`text-[#2D1B00] ${fullScreen ? 'w-6 h-6 md:w-8 md:h-8' : 'w-4 h-4'}`} />
                      <span>{format(new Date(time), 'MMM d, h:mm a')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              {event.location && (
                <div className={`flex items-center gap-3 text-[#6B4E00] mb-6 md:mb-8 ${fullScreen ? 'text-xl md:text-2xl' : ''}`}>
                  <MapPin className={`text-[#2D1B00] ${fullScreen ? 'w-6 h-6 md:w-8 md:h-8' : 'w-4 h-4'}`} />
                  <span>{event.location.name || event.location.address}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className={`flex gap-4 md:gap-6 mt-auto ${fullScreen ? 'mt-8' : ''}`}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Decline button clicked');
                    handleButtonClick('left');
                  }}
                  disabled={swiped || isProcessing}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors border border-red-300 cursor-pointer z-50 relative ${fullScreen ? 'text-xl md:text-2xl' : ''} ${(swiped || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <X className={fullScreen ? 'w-6 h-6 md:w-8 md:h-8' : 'w-5 h-5'} />
                  Decline
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Accept button clicked');
                    handleButtonClick('right');
                  }}
                  disabled={swiped || isProcessing}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-[rgba(193,125,58,0.8)] hover:bg-[rgba(193,125,58,0.9)] text-[#2D1B00] rounded-lg font-medium transition-colors border border-[#2D1B00]/20 backdrop-blur-sm cursor-pointer z-50 relative ${fullScreen ? 'text-xl md:text-2xl' : ''} ${(swiped || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Check className={fullScreen ? 'w-6 h-6 md:w-8 md:h-8' : 'w-5 h-5'} />
                  Accept
                </button>
              </div>

              {/* Processing indicator */}
              {(swiped || isProcessing) && (
                <p className={`text-center text-[#6B4E00] mt-4 ${fullScreen ? 'text-lg md:text-xl' : 'text-xs'}`}>
                  Processing...
                </p>
              )}
    </motion.div>
  );

  // For full screen mode, show recorder with card overlay
  if (fullScreen) {
    return (
      <div className={containerClass}>
        <ReactionRecorder
          ref={recorderRef}
          onReactionRecorded={handleReactionRecorded}
          eventId={event._id}
          showVideo={!swiped} // Hide video after swipe, but keep component mounted
          overlayContent={
            !swiped ? (
              <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <div className="w-full max-w-3xl mx-auto px-4 pointer-events-auto" style={{ height: '80%' }}>
                  <div className="relative w-full h-full">
                    {swipeCardContent}
                  </div>
                </div>
              </div>
            ) : null // Hide overlay after swipe, but keep recorder mounted
          }
        />
      </div>
    );
  }

  // For non-full screen mode, show card normally
  return (
    <div className={containerClass}>
      {swipeCardContent}
    </div>
  );
}

export default EventSwipe;

