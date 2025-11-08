import { useState, useRef, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { format } from 'date-fns';
import { Calendar, MapPin, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactionRecorder from './ReactionRecorder';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { useAuthStore } from '../store/authStore';

function EventSwipe({ event, onSwiped, fullScreen = false }) {
  const [swiped, setSwiped] = useState(false);
  const [startTime] = useState(Date.now());
  const [reactionData, setReactionData] = useState(null);
  const swipeRef = useRef(null);
  const recorderRef = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const swipeMutation = useMutation({
    mutationFn: async ({ direction, responseTime, emotionData, reactionFile }) => {
      // If we have a reaction file, upload it (even if emotionData is null)
      let reactionMediaId = null;
      if (reactionFile) {
        try {
          // Upload reaction video to Firebase Storage
          const { auth } = await import('../config/firebase');
          const currentUser = auth.currentUser;
          if (!currentUser) throw new Error('Not authenticated');

          // Get fresh token and verify authentication
          const token = await currentUser.getIdToken(true);
          console.log('Uploading reaction video:', {
            uid: currentUser.uid,
            email: currentUser.email,
            fileName: reactionFile.name,
            fileType: reactionFile.type,
            fileSize: reactionFile.size
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
      
      // For full screen mode, close modal immediately
      if (fullScreen) {
        // Close modal immediately (don't wait for success message)
        if (onSwiped) {
          // Call immediately to close the modal
          onSwiped();
        }
      } else {
        // Call onSwiped callback if provided (for non-full screen mode)
        if (onSwiped) {
          setTimeout(() => {
            onSwiped();
          }, 500);
        }
      }
    },
    onError: (error) => {
      console.error('❌ Swipe error:', error);
    }
  });

  const handleReactionRecorded = (reaction) => {
    console.log('✅ Reaction recorded, submitting swipe:', reaction);
    setReactionData(reaction);
    // Mark as swiped immediately to prevent re-rendering the card
    setSwiped(true);
    // Auto-submit swipe after reaction is recorded
    const responseTime = Date.now() - startTime;
    swipeMutation.mutate({
      direction: reaction.swipeDirection,
      responseTime,
      emotionData: reaction.emotion,
      reactionFile: reaction.file
    });
  };

  const handleSwipe = async (direction) => {
    if (swiped) {
      console.log('⚠️ Already swiped, ignoring');
      return;
    }
    
    // For full screen mode, stop recording and save with swipe direction
    if (fullScreen && recorderRef.current) {
      const swipeDirection = direction === 'right' ? 'right' : 'left';
      console.log('🛑 Swipe detected, stopping recording with direction:', swipeDirection);
      
      // Mark as swiped immediately to prevent duplicate interactions
      setSwiped(true);
      
      // Stop recording with the swipe direction
      // The recording will process and call handleReactionRecorded when done
      try {
        recorderRef.current.stopRecording(swipeDirection);
      } catch (error) {
        console.error('Error stopping recording:', error);
        // If recording fails, still submit the swipe
        const responseTime = Date.now() - startTime;
        swipeMutation.mutate({
          direction: swipeDirection,
          responseTime,
          emotionData: null,
          reactionFile: null
        });
      }
      return; // Don't proceed with swipe yet, wait for recording to complete
    }
    
    // For non-full screen, proceed without reaction
    const responseTime = Date.now() - startTime;
    const swipeDirection = direction === 'right' ? 'right' : 'left';
    
    setSwiped(true);
    swipeMutation.mutate({
      direction: swipeDirection,
      responseTime,
      emotionData: null,
      reactionFile: null
    });
  };

  // Recording will start automatically when ReactionRecorder models are loaded

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
                    if (fullScreen) {
                      handleSwipe('left');
                    } else {
                      handleSwipe('left');
                    }
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors border border-red-300 cursor-pointer z-50 relative ${fullScreen ? 'text-xl md:text-2xl' : ''}`}
                >
                  <X className={fullScreen ? 'w-6 h-6 md:w-8 md:h-8' : 'w-5 h-5'} />
                  Decline
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Accept button clicked');
                    if (fullScreen) {
                      handleSwipe('right');
                    } else {
                      handleSwipe('right');
                    }
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-[rgba(193,125,58,0.8)] hover:bg-[rgba(193,125,58,0.9)] text-[#2D1B00] rounded-lg font-medium transition-colors border border-[#2D1B00]/20 backdrop-blur-sm cursor-pointer z-50 relative ${fullScreen ? 'text-xl md:text-2xl' : ''}`}
                >
                  <Check className={fullScreen ? 'w-6 h-6 md:w-8 md:h-8' : 'w-5 h-5'} />
                  Accept
                </button>
              </div>

              {/* Swipe Hint */}
              <p className={`text-center text-[#6B4E00] mt-4 ${fullScreen ? 'text-lg md:text-xl' : 'text-xs'}`}>
                Swipe right to accept, left to decline
              </p>
    </motion.div>
  );

  // For full screen mode, show recorder with card overlay
  if (fullScreen) {
    // If swiped, return null (modal will close via onSwiped callback)
    if (swiped) {
      return null;
    }
    
    // Show card with recording
    return (
      <div className={containerClass}>
        <ReactionRecorder
          ref={recorderRef}
          onReactionRecorded={handleReactionRecorded}
          eventId={event._id}
          showVideo={true}
          overlayContent={
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
              <div className="w-full max-w-3xl mx-auto px-4 pointer-events-auto" style={{ height: '80%' }}>
                <TinderCard
                  ref={swipeRef}
                  className="w-full h-full"
                  onSwipe={handleSwipe}
                  preventSwipe={['up', 'down']}
                  swipeThreshold={50}
                  onCardLeftScreen={(dir) => {
                    // Handle card leaving screen
                    console.log('Card left screen:', dir);
                    if (!swiped) {
                      handleSwipe(dir);
                    }
                  }}
                >
                  <div className="relative w-full h-full">
                    {swipeCardContent}
                  </div>
                </TinderCard>
              </div>
            </div>
          }
        />
      </div>
    );
  }

  // For non-full screen mode, show card normally
  return (
    <div className={containerClass}>
      <TinderCard
        ref={swipeRef}
        className="absolute w-full h-full"
        onSwipe={handleSwipe}
        preventSwipe={['up', 'down']}
        swipeThreshold={50}
      >
        {swipeCardContent}
      </TinderCard>
    </div>
  );
}

export default EventSwipe;

