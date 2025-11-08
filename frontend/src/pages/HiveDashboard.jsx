import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, MapPin, Users, Plus, LogOut as LeaveIcon, Check, X } from 'lucide-react';
import EventSwipe from '../components/EventSwipe';
import Gallery from '../components/Gallery';
import CreateEventModal from '../components/CreateEventModal';
import { BeeDecor, BeeLogo } from '../components/BeeDecor.jsx';

function HiveDashboard() {
  const { hiveId } = useParams();
  const navigate = useNavigate();
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // All hooks must be called at the top, before any conditional returns
  const { data: hive, isLoading: hiveLoading } = useQuery({
    queryKey: ['hive', hiveId],
    queryFn: async () => {
      const response = await api.get(`/hives/${hiveId}`);
      return response.data;
    },
    enabled: !!hiveId // Only run if hiveId exists
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', hiveId],
    queryFn: async () => {
      const response = await api.get(`/events/hive/${hiveId}`);
      return response.data;
    },
    enabled: !!hiveId // Only run if hiveId exists
  });

  const { data: media } = useQuery({
    queryKey: ['media', hiveId],
    queryFn: async () => {
      const response = await api.get(`/media/hive/${hiveId}`);
      return response.data;
    },
    enabled: !!hiveId // Only run if hiveId exists
  });

  // Get current user - must be called before any early returns
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    }
  });

  const queryClient = useQueryClient();

  // Leave hive mutation
  const leaveHiveMutation = useMutation({
    mutationFn: async () => {
      return api.delete(`/hives/${hiveId}/members/me`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['hives']);
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Error leaving hive:', error);
      alert(error.response?.data?.error || 'Failed to leave hive');
    }
  });

  // Change event swipe status mutation
  const changeSwipeMutation = useMutation({
    mutationFn: async ({ eventId, direction }) => {
      console.log('Changing swipe status:', { eventId, direction });
      try {
        const response = await api.post(`/events/${eventId}/swipe`, {
          swipeDirection: direction === 'right' ? 'right' : 'left',
          responseTime: 0
        });
        return response;
      } catch (error) {
        console.error('Swipe error:', error);
        console.error('Error response:', error.response?.data);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events', hiveId]);
      queryClient.invalidateQueries(['hive', hiveId]);
    },
    onError: (error) => {
      console.error('Failed to change swipe status:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update swipe status';
      alert(`Error: ${errorMessage}`);
    }
  });

  const handleLeaveHive = () => {
    if (window.confirm(`Are you sure you want to leave "${hive?.name}"?`)) {
      leaveHiveMutation.mutate();
    }
  };

  const handleChangeSwipe = (event, newDirection) => {
    changeSwipeMutation.mutate({
      eventId: event._id,
      direction: newDirection
    });
  };

  // Early returns AFTER all hooks
  if (hiveLoading || eventsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!hive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hive not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary-600 hover:text-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const pendingEvents = events?.filter(event => {
    if (event.status !== 'proposed') return false;
    const hasSwiped = event.acceptedBy?.some(id => id._id === currentUser?._id) ||
                     event.declinedBy?.some(id => id._id === currentUser?._id);
    return !hasSwiped;
  }) || [];

  return (
    <div className="min-h-screen honey-gradient-bg relative overflow-hidden">
      {/* Honeycomb Decorations */}
      <BeeDecor />

      {/* Header */}
      <header className="bg-[rgba(212,165,116,0.8)] backdrop-blur-md border-b border-[#2D1B00]/20 relative z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-[#2D1B00] hover:text-[#6B4E00] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <BeeLogo />
              <div>
                <h1 className="text-[#2D1B00] text-xl font-medium">{hive.name}</h1>
                <p className="text-sm text-[#6B4E00]">{hive.members?.length || 0} members</p>
              </div>
            </div>
            <button
              onClick={handleLeaveHive}
              disabled={leaveHiveMutation.isLoading}
              className="bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50 border border-red-300 font-medium px-4 py-2 flex items-center gap-2"
            >
              <LeaveIcon className="w-5 h-5" />
              Leave Hive
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 relative z-10">
        {/* Pending Events Swipe */}
        {pendingEvents.length > 0 && (
          <section className="mb-6">
            <div className="honey-card p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <HexagonIcon />
                <h2 className="text-[#2D1B00] text-xl font-medium">Pending Events</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {pendingEvents.map((event) => (
                  <EventSwipe key={event._id} event={event} />
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
                {/* Actions */}
                     <div className="honey-card p-6 mb-6">
                     <button
                       onClick={() => setShowCreateEvent(true)}
                       className="hexagon-button w-16 h-16 flex items-center justify-center mx-auto text-[#2D1B00] transition-colors"
                       title="Create New Hive Event"
                     >
                       <Plus className="w-8 h-8" />
                     </button>
                     <p className="text-center mt-4 text-[#2D1B00] font-medium">Create New Hive Event</p>
                   </div>

                {/* Event Timeline */}
                <div className="honey-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <HexagonIcon />
                    <h2 className="text-[#2D1B00] text-xl font-medium">Event Timeline</h2>
                  </div>
              <div className="space-y-4">
                {events && events.length > 0 ? (
                  events.map((event) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                          className="honey-card border-l-4 border-[#C17D3A] pl-4 py-3 mb-3"
                        >
                             <div className="flex items-center justify-between mb-2">
                               <h3 className="font-medium text-[#2D1B00]">{event.title}</h3>
                               <span className={`hexagon-badge px-3 py-1 text-xs font-medium ${
                                 event.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                 event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                 'text-[#2D1B00]'
                               }`}>
                                 {event.status}
                               </span>
                             </div>
                          {event.description && (
                            <p className="text-sm text-[#6B4E00] mb-2">{event.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-[#6B4E00]">
                            {event.confirmedTime && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-[#2D1B00]" />
                                <span>{format(new Date(event.confirmedTime), 'MMM d, h:mm a')}</span>
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-[#2D1B00]" />
                                <span>{event.location.name || event.location.address}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Users className="w-4 h-4 text-[#2D1B00]" />
                            <span className="text-sm text-[#6B4E00]">
                              {event.acceptedBy?.length || 0} accepted, {event.declinedBy?.length || 0} declined
                            </span>
                          </div>
                      
                      {/* Show user's current status and allow changing */}
                      {currentUser && event.status === 'proposed' && (
                        <div className="mt-3 flex items-center gap-2">
                              {event.acceptedBy?.some(id => {
                                const userId = typeof id === 'object' ? id._id?.toString() : id?.toString();
                                return userId === currentUser._id?.toString();
                              }) ? (
                                <>
                                  <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                                    <Check className="w-4 h-4" />
                                    You accepted
                                  </span>
                                  <button
                                    onClick={() => handleChangeSwipe(event, 'left')}
                                    disabled={changeSwipeMutation.isLoading}
                                    className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50 font-medium transition-colors underline"
                                  >
                                    Change to Decline
                                  </button>
                                </>
                              ) : event.declinedBy?.some(id => {
                                const userId = typeof id === 'object' ? id._id?.toString() : id?.toString();
                                return userId === currentUser._id?.toString();
                              }) ? (
                                <>
                                  <span className="text-sm text-red-600 font-medium flex items-center gap-1">
                                    <X className="w-4 h-4" />
                                    You declined
                                  </span>
                                  <button
                                    onClick={() => handleChangeSwipe(event, 'right')}
                                    disabled={changeSwipeMutation.isLoading}
                                    className="text-sm text-green-600 hover:text-green-700 disabled:opacity-50 font-medium transition-colors underline"
                                  >
                                    Change to Accept
                                  </button>
                                </>
                              ) : null}
                        </div>
                      )}
                      
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowGallery(true);
                              }}
                              className="text-sm text-[#2D1B00] hover:text-[#6B4E00] font-medium transition-colors underline"
                            >
                              View Media
                            </button>
                          </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-[#6B4E00] text-center py-8">No events yet. Create your first event!</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Members */}
          <div className="lg:col-span-1">
              <div className="honey-card p-6 sticky top-4">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-[#2D1B00]" />
                  <h2 className="text-[#2D1B00] text-xl font-medium">Members</h2>
                </div>
                     <div className="space-y-3">
                       {hive.members && hive.members.map((member) => (
                         <div key={member._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[rgba(245,230,211,0.6)] transition-colors">
                           <div className="hexagon-avatar w-10 h-10 overflow-hidden flex-shrink-0">
                             <img
                               src={member.profilePhoto || `https://ui-avatars.com/api/?name=${member.name}`}
                               alt={member.name}
                               className="w-full h-full object-cover"
                             />
                           </div>
                           <div>
                             <p className="font-medium text-[#2D1B00]">{member.name}</p>
                             {member.major && (
                               <p className="text-sm text-[#6B4E00]">{member.major}</p>
                             )}
                           </div>
                         </div>
                       ))}
                     </div>
              </div>
            </div>
          </div>
        </main>

        {/* Modals */}
        {showCreateEvent && (
          <CreateEventModal
            hiveId={hiveId}
            onClose={() => setShowCreateEvent(false)}
          />
        )}

        {showGallery && (
          <Gallery
            hiveId={hiveId}
            eventId={selectedEvent?._id}
            onClose={() => {
              setShowGallery(false);
              setSelectedEvent(null);
            }}
          />
        )}
      </div>
    );
  }

function HexagonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-[#2D1B00]"
      style={{ color: '#2D1B00' }}
    >
      <path
        d="M 6 1 L 14 1 L 19 10 L 14 19 L 6 19 L 1 10 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default HiveDashboard;

