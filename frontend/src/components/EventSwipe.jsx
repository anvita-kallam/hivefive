import { useState, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';
import { format } from 'date-fns';
import { Calendar, MapPin, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function EventSwipe({ event, onSwiped, fullScreen = false }) {
  const [swiped, setSwiped] = useState(false);
  const [startTime] = useState(Date.now());
  const swipeRef = useRef(null);
  const queryClient = useQueryClient();

  const swipeMutation = useMutation({
    mutationFn: async ({ direction, responseTime }) => {
      return api.post(`/events/${event._id}/swipe`, {
        swipeDirection: direction,
        responseTime,
        emotionData: null, // TODO: Add emotion detection from camera
        gpsData: null // TODO: Add GPS data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      queryClient.invalidateQueries(['allEvents']);
      queryClient.invalidateQueries(['hive', event.hiveID]);
      queryClient.invalidateQueries(['hives']);
      setSwiped(true);
      // Call onSwiped callback if provided (for full screen mode)
      if (onSwiped) {
        // Wait a bit to show the success state
        setTimeout(() => {
          onSwiped();
        }, fullScreen ? 1500 : 500);
      }
    }
  });

  const handleSwipe = (direction) => {
    if (swiped) return;
    
    const responseTime = Date.now() - startTime;
    const swipeDirection = direction === 'right' ? 'right' : 'left';
    
    swipeMutation.mutate({
      direction: swipeDirection,
      responseTime
    });
  };

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

  return (
    <div className={containerClass}>
      <TinderCard
        ref={swipeRef}
        className="absolute w-full h-full"
        onSwipe={handleSwipe}
        preventSwipe={['up', 'down']}
        swipeThreshold={50}
      >
        <motion.div
          className={cardClass}
          whileHover={fullScreen ? {} : { scale: 1.02 }}
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
                  onClick={() => handleSwipe('left')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors border border-red-300 ${fullScreen ? 'text-xl md:text-2xl' : ''}`}
                >
                  <X className={fullScreen ? 'w-6 h-6 md:w-8 md:h-8' : 'w-5 h-5'} />
                  Decline
                </button>
                <button
                  onClick={() => handleSwipe('right')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-[rgba(193,125,58,0.8)] hover:bg-[rgba(193,125,58,0.9)] text-[#2D1B00] rounded-lg font-medium transition-colors border border-[#2D1B00]/20 backdrop-blur-sm ${fullScreen ? 'text-xl md:text-2xl' : ''}`}
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
      </TinderCard>
    </div>
  );
}

export default EventSwipe;

