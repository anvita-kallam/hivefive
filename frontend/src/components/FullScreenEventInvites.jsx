import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';
import EventSwipe from './EventSwipe';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function FullScreenEventInvites() {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [justClosed, setJustClosed] = useState(false);
  const [swipedEventIds, setSwipedEventIds] = useState(new Set()); // Track locally swiped events
  const queryClient = useQueryClient();

  // Get all hives
  const { data: hives } = useQuery({
    queryKey: ['hives'],
    queryFn: async () => {
      const response = await api.get('/hives');
      return response.data;
    }
  });

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    }
  });

  // Get events for all hives
  const { data: allEvents = [], error: eventsError } = useQuery({
    queryKey: ['allEvents'],
    queryFn: async () => {
      if (!hives || hives.length === 0) return [];
      
      try {
        const eventPromises = hives.map(hive => 
          api.get(`/events/hive/${hive._id}`).then(res => res.data).catch(error => {
            // Log error but don't fail the entire request
            console.warn(`Error fetching events for hive ${hive._id}:`, error.response?.status, error.message);
            // Return empty array for this hive
            return [];
          })
        );
        const eventsArrays = await Promise.all(eventPromises);
        return eventsArrays.flat();
      } catch (error) {
        console.error('Error fetching all events:', error);
        // Return empty array on error so app doesn't crash
        return [];
      }
    },
    enabled: !!hives && hives.length > 0,
    retry: 1, // Only retry once
    retryDelay: 1000
  });

  // Filter pending events (events user hasn't responded to)
  const pendingEvents = useMemo(() => {
    if (!allEvents || !currentUser) return [];
    
    return allEvents.filter(event => {
      // Skip events that have been locally swiped (even if backend hasn't updated yet)
      if (swipedEventIds.has(event._id)) {
        return false;
      }
      
      // Only show proposed events
      if (event.status !== 'proposed') return false;
      
      // Check if user has swiped on this event (check swipeLogs)
      if (event.swipeLogs && event.swipeLogs.length > 0) {
        const hasSwiped = event.swipeLogs.some(
          log => {
            const logUserId = typeof log.userID === 'object' 
              ? log.userID._id?.toString() || log.userID.toString()
              : log.userID?.toString();
            return logUserId === currentUser._id?.toString();
          }
        );
        if (hasSwiped) return false;
      }
      
      // Also check acceptedBy and declinedBy arrays (fallback)
      const isAccepted = event.acceptedBy?.some(
        id => (typeof id === 'object' ? id._id : id)?.toString() === currentUser._id?.toString()
      );
      const isDeclined = event.declinedBy?.some(
        id => (typeof id === 'object' ? id._id : id)?.toString() === currentUser._id?.toString()
      );
      
      // Show event if user hasn't accepted or declined
      return !isAccepted && !isDeclined;
    });
  }, [allEvents, currentUser, swipedEventIds]);

  // Open modal when there are pending events
  useEffect(() => {
    // Don't reopen immediately after closing (wait longer for backend to process)
    if (justClosed) {
      console.log('Modal just closed, preventing reopening');
      return;
    }
    
    if (pendingEvents.length > 0 && !isOpen) {
      console.log('Opening modal with pending events:', pendingEvents.length);
      setIsOpen(true);
      setCurrentEventIndex(0);
    } else if (pendingEvents.length === 0 && isOpen) {
      // Close if no more pending events
      console.log('No more pending events, closing modal');
      setIsOpen(false);
      setCurrentEventIndex(0);
      setJustClosed(true);
    }
  }, [pendingEvents.length, isOpen, justClosed]);
  
  // Reset justClosed flag after a longer delay to allow backend to process swipe
  useEffect(() => {
    if (justClosed) {
      const timer = setTimeout(() => {
        console.log('Resetting justClosed flag after delay');
        setJustClosed(false);
      }, 10000); // Wait 10 seconds for backend to process and queries to update
      return () => clearTimeout(timer);
    }
  }, [justClosed]);

  // Update current index if pending events change
  useEffect(() => {
    if (currentEventIndex >= pendingEvents.length && pendingEvents.length > 0) {
      setCurrentEventIndex(0);
    }
  }, [pendingEvents.length, currentEventIndex]);

  // Handle event swiped
  const handleEventSwiped = useCallback((eventId) => {
    console.log('Event swiped, marking as swiped locally:', eventId);
    
    // Mark this event as swiped locally immediately
    // This prevents it from showing up even if queries refetch before backend updates
    if (eventId) {
      setSwipedEventIds(prev => new Set([...prev, eventId]));
    }
    
    // Close modal immediately - set all states synchronously
    setJustClosed(true);
    setIsOpen(false);
    setCurrentEventIndex(0);
    
    // Don't invalidate queries immediately - wait for the swipe mutation to complete
    // The mutation will handle query invalidation when it succeeds
    // This prevents the modal from reopening before the backend has processed the swipe
    
    // Only invalidate queries after a delay to allow backend to process
    setTimeout(() => {
      console.log('Invalidating queries after swipe');
      queryClient.invalidateQueries(['allEvents']);
      queryClient.invalidateQueries(['events']);
      queryClient.invalidateQueries(['hives']);
      queryClient.invalidateQueries(['media']);
    }, 2000); // Wait 2 seconds for backend to process
  }, [queryClient]);

  // Handle skip/close
  const handleSkip = () => {
    if (currentEventIndex < pendingEvents.length - 1) {
      setCurrentEventIndex(currentEventIndex + 1);
    } else {
      setIsOpen(false);
    }
  };

  // Handle close all
  const handleClose = () => {
    setJustClosed(true);
    setIsOpen(false);
    setCurrentEventIndex(0);
  };

  // Early return if modal should be closed - this prevents any rendering
  // This check happens before any other logic to ensure immediate closure
  if (justClosed) {
    return null;
  }
  
  if (!isOpen) {
    return null;
  }
  
  // Don't render if no pending events
  if (!pendingEvents || pendingEvents.length === 0) {
    return null;
  }
  
  // Safety check - don't render if current event doesn't exist
  if (currentEventIndex >= pendingEvents.length || !pendingEvents[currentEventIndex]) {
    return null;
  }

  const currentEvent = pendingEvents[currentEventIndex];
  const eventNumber = currentEventIndex + 1;
  const totalEvents = pendingEvents.length;

  return (
    <AnimatePresence>
      {isOpen && (
            <motion.div
              key={`modal-${currentEvent._id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-[#2D1B00] bg-opacity-95 flex items-center justify-center"
            >
          <div className="w-full h-full flex flex-col items-center justify-center p-4 relative">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Event counter */}
            <div className="absolute top-4 left-4 text-white text-lg font-medium z-10">
              Event {eventNumber} of {totalEvents}
            </div>

            {/* Skip button */}
            {totalEvents > 1 && (
              <button
                onClick={handleSkip}
                className="absolute bottom-4 right-4 text-white hover:text-gray-300 transition-colors z-10 px-4 py-2 bg-white bg-opacity-10 rounded-lg"
              >
                Skip for now
              </button>
            )}

            {/* Event swipe card - full screen */}
            <div className="w-full max-w-2xl h-full max-h-[80vh] flex items-center justify-center">
              <motion.div
                key={currentEvent._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full h-full"
              >
                <FullScreenEventSwipe 
                  event={currentEvent} 
                  onSwiped={() => handleEventSwiped(currentEvent._id)}
                />
              </motion.div>
            </div>

            {/* Progress dots */}
            {totalEvents > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {pendingEvents.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentEventIndex
                        ? 'bg-white'
                        : 'bg-white bg-opacity-30'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Full screen version of EventSwipe - uses the same component with fullScreen prop
function FullScreenEventSwipe({ event, onSwiped }) {
  return (
    <div className="w-full h-full relative">
      <EventSwipe event={event} onSwiped={onSwiped} fullScreen={true} />
    </div>
  );
}

export default FullScreenEventInvites;

