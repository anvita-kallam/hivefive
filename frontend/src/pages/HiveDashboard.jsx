import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, MapPin, Users, Plus, LogOut as LeaveIcon, Check, X, Bee } from 'lucide-react';
import EventSwipe from '../components/EventSwipe';
import Gallery from '../components/Gallery';
import CreateEventModal from '../components/CreateEventModal';

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
    <div className="min-h-screen honey-gradient-bg honeycomb-pattern">
      {/* Header */}
      <header className="bg-gradient-to-r from-honey-light via-honey-gold to-honey-amber shadow-lg border-b-4 border-honey-brown">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="buzz-hover p-2 bg-honey-gold hover:bg-honey-amber rounded-lg border-2 border-honey-brown"
              >
                <ArrowLeft className="w-5 h-5 text-honey-brown" />
              </button>
              <Bee className="w-6 h-6 text-honey-brown bee-icon" />
              <div>
                <h1 className="text-2xl font-bold honey-text text-honey-brown">{hive.name}</h1>
                <p className="text-sm text-honey-amber-dark font-semibold">{hive.members?.length || 0} members</p>
              </div>
            </div>
            <button
              onClick={handleLeaveHive}
              disabled={leaveHiveMutation.isLoading}
              className="buzz-hover flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50 border-2 border-red-300 font-semibold"
            >
              <LeaveIcon className="w-5 h-5" />
              Leave Hive
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending Events Swipe */}
        {pendingEvents.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Bee className="w-6 h-6 text-honey-brown bee-icon" />
              <h2 className="text-2xl font-bold honey-text text-honey-brown">Pending Events</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {pendingEvents.map((event) => (
                <EventSwipe key={event._id} event={event} />
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Actions */}
            <div className="honey-card p-6">
              <button
                onClick={() => setShowCreateEvent(true)}
                className="wax-seal-button buzz-hover mx-auto flex items-center justify-center gap-2"
                title="Create New Hive Event"
              >
                <Plus className="w-8 h-8" />
              </button>
              <p className="text-center mt-4 text-honey-brown font-bold honey-text">Create New Hive Event</p>
            </div>

            {/* Event Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Timeline</h2>
              <div className="space-y-4">
                {events && events.length > 0 ? (
                  events.map((event) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-l-4 border-primary-500 pl-4 py-2"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          event.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {event.confirmedTime && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(event.confirmedTime), 'MMM d, h:mm a')}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location.name || event.location.address}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
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
                                className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50 underline"
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
                                className="text-sm text-green-600 hover:text-green-700 disabled:opacity-50 underline"
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
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          View Media
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500">No events yet. Create your first event!</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Members */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Members</h2>
              <div className="space-y-4">
                {hive.members && hive.members.map((member) => (
                  <div key={member._id} className="flex items-center gap-3">
                    <img
                      src={member.profilePhoto || `https://ui-avatars.com/api/?name=${member.name}`}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      {member.major && (
                        <p className="text-sm text-gray-600">{member.major}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default HiveDashboard;

