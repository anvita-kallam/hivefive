import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, MapPin, Users, Check, X, Trash2, Image as ImageIcon } from 'lucide-react';
import MapContainer from '../components/MapView';
import EventReactions from '../components/EventReactions';
import Gallery from '../components/Gallery';
import { BeeDecor, BeeLogo } from '../components/BeeDecor.jsx';

function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showGallery, setShowGallery] = useState(false);

  // Get event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const response = await api.get(`/events/${eventId}`);
      return response.data;
    },
    enabled: !!eventId
  });

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    }
  });

  // Get hive details
  const { data: hive } = useQuery({
    queryKey: ['hive', event?.hiveID],
    queryFn: async () => {
      if (!event?.hiveID) return null;
      const response = await api.get(`/hives/${event.hiveID}`);
      return response.data;
    },
    enabled: !!event?.hiveID
  });

  // Get all media for the event
  const { data: media } = useQuery({
    queryKey: ['media', eventId],
    queryFn: async () => {
      const response = await api.get(`/media/event/${eventId}`);
      return response.data;
    },
    enabled: !!eventId
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId) => {
      return api.delete(`/events/${eventId}`);
    },
    onSuccess: () => {
      if (event?.hiveID) {
        navigate(`/hive/${event.hiveID}`);
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
      alert(error.response?.data?.error || 'Failed to delete event');
    }
  });

  // Change event swipe status mutation
  const changeSwipeMutation = useMutation({
    mutationFn: async ({ eventId, direction }) => {
      return api.post(`/events/${eventId}/swipe`, {
        swipeDirection: direction === 'right' ? 'right' : 'left',
        responseTime: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['event', eventId]);
      queryClient.invalidateQueries(['events']);
    },
    onError: (error) => {
      console.error('Failed to change swipe status:', error);
      alert(error.response?.data?.error || 'Failed to update swipe status');
    }
  });

  const handleDeleteEvent = async () => {
    if (!window.confirm(`Are you sure you want to delete "${event?.title}"? This action cannot be undone.`)) {
      return;
    }
    deleteEventMutation.mutate(eventId);
  };

  const handleChangeSwipe = (newDirection) => {
    changeSwipeMutation.mutate({
      eventId: eventId,
      direction: newDirection
    });
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen honey-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C17D3A] mx-auto mb-4"></div>
          <p className="text-[#2D1B00]">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen honey-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2D1B00] mb-2">Event not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-[#C17D3A] hover:text-[#6B4E00] underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isCreator = currentUser && event.createdBy && 
    (typeof event.createdBy === 'object' 
      ? event.createdBy._id?.toString() === currentUser._id?.toString()
      : event.createdBy?.toString() === currentUser._id?.toString());

  const userAccepted = event.acceptedBy?.some(id => {
    const userId = typeof id === 'object' ? id._id?.toString() : id?.toString();
    return userId === currentUser?._id?.toString();
  });

  const userDeclined = event.declinedBy?.some(id => {
    const userId = typeof id === 'object' ? id._id?.toString() : id?.toString();
    return userId === currentUser?._id?.toString();
  });

  // Separate reaction media from regular media
  const reactionMedia = media?.filter(m => m.isReaction) || [];
  const regularMedia = media?.filter(m => !m.isReaction) || [];

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
                onClick={() => event?.hiveID ? navigate(`/hive/${event.hiveID}`) : navigate('/dashboard')}
                className="text-[#2D1B00] hover:text-[#6B4E00] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <BeeLogo />
              <div>
                <h1 className="text-[#2D1B00] text-xl font-medium">Event Details</h1>
                <p className="text-sm text-[#6B4E00]">{hive?.name || 'Hive'}</p>
              </div>
            </div>
            {isCreator && (
              <button
                onClick={handleDeleteEvent}
                disabled={deleteEventMutation.isLoading}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Delete event"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="honey-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-[#2D1B00] mb-2">{event.title}</h2>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    event.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {event.status}
                  </span>
                </div>
              </div>

              {event.description && (
                <p className="text-[#6B4E00] mb-4 text-lg">{event.description}</p>
              )}

              {/* Event Times */}
              <div className="space-y-3 mb-4">
                <h3 className="text-[#2D1B00] font-medium text-lg">Proposed Times</h3>
                <div className="space-y-2">
                  {event.proposedTimes && event.proposedTimes.map((time, index) => (
                    <div key={index} className="flex items-center gap-2 text-[#6B4E00]">
                      <Calendar className="w-5 h-5 text-[#2D1B00]" />
                      <span>{format(new Date(time), 'EEEE, MMMM d, yyyy h:mm a')}</span>
                    </div>
                  ))}
                </div>
                {event.confirmedTime && (
                  <div className="mt-3 pt-3 border-t border-[#2D1B00]/20">
                    <p className="text-sm text-[#6B4E00] mb-1">Confirmed Time:</p>
                    <div className="flex items-center gap-2 text-[#2D1B00] font-medium">
                      <Calendar className="w-5 h-5" />
                      <span>{format(new Date(event.confirmedTime), 'EEEE, MMMM d, yyyy h:mm a')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* User Response Section */}
              {currentUser && event.status === 'proposed' && (
                <div className="mt-4 pt-4 border-t border-[#2D1B00]/20">
                  {userAccepted ? (
                    <div className="flex items-center gap-3">
                      <span className="text-green-600 font-medium flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        You accepted this event
                      </span>
                      <button
                        onClick={() => handleChangeSwipe('left')}
                        disabled={changeSwipeMutation.isLoading}
                        className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50 font-medium transition-colors underline"
                      >
                        Change to Decline
                      </button>
                    </div>
                  ) : userDeclined ? (
                    <div className="flex items-center gap-3">
                      <span className="text-red-600 font-medium flex items-center gap-2">
                        <X className="w-5 h-5" />
                        You declined this event
                      </span>
                      <button
                        onClick={() => handleChangeSwipe('right')}
                        disabled={changeSwipeMutation.isLoading}
                        className="text-sm text-green-600 hover:text-green-700 disabled:opacity-50 font-medium transition-colors underline"
                      >
                        Change to Accept
                      </button>
                    </div>
                  ) : (
                    <p className="text-[#6B4E00]">You haven't responded to this event yet.</p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Location Map */}
            {event.location && event.location.coordinates && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="honey-card p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-[#2D1B00]" />
                  <h3 className="text-[#2D1B00] font-medium text-lg">Location</h3>
                </div>
                {event.location.name && (
                  <p className="text-[#6B4E00] mb-3 font-medium">{event.location.name}</p>
                )}
                {event.location.address && (
                  <p className="text-[#6B4E00] mb-4">{event.location.address}</p>
                )}
                <div className="rounded-lg overflow-hidden border border-[#2D1B00]/20" style={{ height: '400px' }}>
                  <MapContainer location={event.location} />
                </div>
              </motion.div>
            )}

            {/* Photo Gallery */}
            {regularMedia && regularMedia.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="honey-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-[#2D1B00]" />
                    <h3 className="text-[#2D1B00] font-medium text-lg">Photo Gallery</h3>
                  </div>
                  <button
                    onClick={() => setShowGallery(true)}
                    className="text-sm text-[#C17D3A] hover:text-[#6B4E00] font-medium underline"
                  >
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {regularMedia.slice(0, 6).map((item) => (
                    <div
                      key={item._id}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setShowGallery(true)}
                    >
                      {item.fileType === 'image' || item.fileType === 'livephoto' ? (
                        <img
                          src={item.fileURL}
                          alt={item.caption || 'Gallery item'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={item.fileURL}
                          className="w-full h-full object-cover"
                          muted
                        />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Reaction Photos with Sentiment Analysis */}
            {reactionMedia && reactionMedia.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="honey-card p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-[#2D1B00]" />
                  <h3 className="text-[#2D1B00] font-medium text-lg">Reaction Photos & Sentiment Analysis</h3>
                </div>
                <EventReactions event={event} showTitle={false} size="large" />
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Attendees */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="honey-card p-6 sticky top-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-[#2D1B00]" />
                <h3 className="text-[#2D1B00] font-medium text-lg">Attendees</h3>
              </div>

              {/* Accepted */}
              {event.acceptedBy && event.acceptedBy.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-[#2D1B00]">
                      Accepted ({event.acceptedBy.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {event.acceptedBy.map((member) => {
                      const memberData = typeof member === 'object' ? member : { _id: member };
                      return (
                        <div key={memberData._id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[rgba(245,230,211,0.6)] transition-colors">
                          <div className="hexagon-avatar w-8 h-8 overflow-hidden flex-shrink-0">
                            <img
                              src={memberData.profilePhoto || `https://ui-avatars.com/api/?name=${memberData.name || 'User'}`}
                              alt={memberData.name || 'User'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-sm text-[#2D1B00]">{memberData.name || 'User'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Declined */}
              {event.declinedBy && event.declinedBy.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <X className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-[#2D1B00]">
                      Declined ({event.declinedBy.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {event.declinedBy.map((member) => {
                      const memberData = typeof member === 'object' ? member : { _id: member };
                      return (
                        <div key={memberData._id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[rgba(245,230,211,0.6)] transition-colors">
                          <div className="hexagon-avatar w-8 h-8 overflow-hidden flex-shrink-0">
                            <img
                              src={memberData.profilePhoto || `https://ui-avatars.com/api/?name=${memberData.name || 'User'}`}
                              alt={memberData.name || 'User'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-sm text-[#2D1B00]">{memberData.name || 'User'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(!event.acceptedBy || event.acceptedBy.length === 0) && 
               (!event.declinedBy || event.declinedBy.length === 0) && (
                <p className="text-[#6B4E00] text-sm">No responses yet.</p>
              )}
            </motion.div>

            {/* Event Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="honey-card p-6 mt-6"
            >
              <h3 className="text-[#2D1B00] font-medium mb-4">Event Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#6B4E00]">Total Responses</span>
                  <span className="text-[#2D1B00] font-medium">
                    {(event.acceptedBy?.length || 0) + (event.declinedBy?.length || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B4E00]">Acceptance Rate</span>
                  <span className="text-[#2D1B00] font-medium">
                    {hive?.members?.length > 0
                      ? `${Math.round(((event.acceptedBy?.length || 0) / hive.members.length) * 100)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B4E00]">Photos</span>
                  <span className="text-[#2D1B00] font-medium">
                    {regularMedia?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B4E00]">Reactions</span>
                  <span className="text-[#2D1B00] font-medium">
                    {reactionMedia?.length || 0}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Gallery Modal */}
      {showGallery && (
        <Gallery
          hiveId={event.hiveID}
          eventId={eventId}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  );
}

export default EventDetail;

