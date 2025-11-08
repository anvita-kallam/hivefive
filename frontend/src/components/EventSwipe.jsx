import { useState, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';
import { format } from 'date-fns';
import { Calendar, MapPin, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function EventSwipe({ event }) {
  const [swiped, setSwiped] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
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
      queryClient.invalidateQueries(['hive', event.hiveID]);
    }
  });

  const handleSwipe = (direction) => {
    if (swiped) return;
    
    const responseTime = Date.now() - startTime;
    const swipeDirection = direction === 'right' ? 'right' : 'left';
    
    setSwiped(true);
    swipeMutation.mutate({
      direction: swipeDirection,
      responseTime
    });
  };

  if (swiped) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-80 h-96 bg-gray-100 rounded-2xl flex items-center justify-center"
      >
        <p className="text-gray-500">Thanks for your response!</p>
      </motion.div>
    );
  }

  return (
    <div className="w-80 h-96 relative">
      <TinderCard
        ref={swipeRef}
        className="absolute w-full h-full"
        onSwipe={handleSwipe}
        preventSwipe={['up', 'down']}
        swipeThreshold={50}
      >
        <motion.div
          className="w-full h-full bg-white rounded-2xl shadow-xl p-6 flex flex-col cursor-grab active:cursor-grabbing"
          whileHover={{ scale: 1.02 }}
        >
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>
            {event.description && (
              <p className="text-gray-600">{event.description}</p>
            )}
          </div>

          {/* Proposed Times */}
          <div className="flex-1 space-y-3 mb-4">
            <h4 className="font-semibold text-gray-900">Proposed Times:</h4>
            {event.proposedTimes && event.proposedTimes.map((time, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4 text-primary-600" />
                <span>{format(new Date(time), 'MMM d, h:mm a')}</span>
              </div>
            ))}
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-gray-700 mb-4">
              <MapPin className="w-4 h-4 text-primary-600" />
              <span>{event.location.name || event.location.address}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-auto">
            <button
              onClick={() => handleSwipe('left')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
            >
              <X className="w-5 h-5" />
              Decline
            </button>
            <button
              onClick={() => handleSwipe('right')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium"
            >
              <Check className="w-5 h-5" />
              Accept
            </button>
          </div>

          {/* Swipe Hint */}
          <p className="text-center text-xs text-gray-500 mt-2">
            Swipe right to accept, left to decline
          </p>
        </motion.div>
      </TinderCard>
    </div>
  );
}

export default EventSwipe;

