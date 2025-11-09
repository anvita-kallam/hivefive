import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, MapPin, Users, Plus, LogOut as LeaveIcon, Check, X, Trash2, UserPlus, Edit2, Save } from 'lucide-react';
import EventSwipe from '../components/EventSwipe';
import Gallery from '../components/Gallery';
import CreateEventModal from '../components/CreateEventModal';
import EventReactions from '../components/EventReactions';
import BuzzChat from '../components/BuzzChat';
import { BeeDecor, BeeLogo } from '../components/BeeDecor.jsx';
import { AnimatePresence } from 'framer-motion';

function HiveDashboard() {
  const { hiveId } = useParams();
  const navigate = useNavigate();
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

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

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId) => {
      return api.delete(`/events/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events', hiveId]);
      queryClient.invalidateQueries(['hive', hiveId]);
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
      alert(error.response?.data?.error || 'Failed to delete event');
    }
  });

  const handleDeleteEvent = async (event) => {
    if (!window.confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`)) {
      return;
    }
    deleteEventMutation.mutate(event._id);
  };

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

  // Update hive name mutation
  const updateHiveNameMutation = useMutation({
    mutationFn: async (newName) => {
      return api.put(`/hives/${hiveId}`, { name: newName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['hive', hiveId]);
      queryClient.invalidateQueries(['hives']);
      setIsEditingName(false);
    },
    onError: (error) => {
      console.error('Error updating hive name:', error);
      alert(error.response?.data?.error || 'Failed to update hive name');
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

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: async (email) => {
      return api.post(`/hives/${hiveId}/members`, { email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['hive', hiveId]);
      queryClient.invalidateQueries(['hives']);
      setMemberEmail('');
      setShowAddMember(false);
    },
    onError: (error) => {
      console.error('Error adding member:', error);
      alert(error.response?.data?.error || 'Failed to add member');
    }
  });

  const handleAddMember = () => {
    const email = memberEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    addMemberMutation.mutate(email);
  };

  // Initialize edited name when hive loads
  useEffect(() => {
    if (hive && !isEditingName) {
      setEditedName(hive.name);
    }
  }, [hive, isEditingName]);

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
              <BeeLogo width={48} height={48} />
              <div>
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editedName.trim()) {
                              updateHiveNameMutation.mutate(editedName.trim());
                            }
                          } else if (e.key === 'Escape') {
                            setIsEditingName(false);
                            setEditedName(hive.name);
                          }
                        }}
                        className="flex-1 px-3 py-1.5 bg-[rgba(255,249,230,0.8)] border border-[#C17D3A]/50 rounded-lg text-[#2D1B00] text-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#C17D3A]"
                        autoFocus
                        disabled={updateHiveNameMutation.isLoading}
                      />
                      <button
                        onClick={() => {
                          if (editedName.trim()) {
                            updateHiveNameMutation.mutate(editedName.trim());
                          }
                        }}
                        disabled={!editedName.trim() || updateHiveNameMutation.isLoading}
                        className="p-1.5 bg-[#C17D3A] hover:bg-[#6B4E00] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Save name"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingName(false);
                          setEditedName(hive.name);
                        }}
                        disabled={updateHiveNameMutation.isLoading}
                        className="p-1.5 bg-[rgba(45,27,0,0.1)] hover:bg-[rgba(45,27,0,0.2)] text-[#2D1B00] rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-[#2D1B00] text-xl font-medium">{hive.name}</h1>
                      <button
                        onClick={() => {
                          setEditedName(hive.name);
                          setIsEditingName(true);
                        }}
                        className="p-1.5 text-[#6B4E00] hover:text-[#C17D3A] hover:bg-[rgba(193,125,58,0.1)] rounded-lg transition-colors"
                        title="Edit hive name"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
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
                          className="honey-card border-l-4 border-[#C17D3A] pl-4 py-3 mb-3 cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => navigate(`/event/${event._id}`)}
                        >
                             <div className="flex items-center justify-between mb-2">
                               <h3 className="font-medium text-[#2D1B00]">{event.title}</h3>
                               <div className="flex items-center gap-2">
                                 <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                   event.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                   event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                   'bg-yellow-100 text-yellow-800'
                                 }`}>
                                   {event.status}
                                 </span>
                                 {/* Delete button - only show for event creator */}
                                 {currentUser && event.createdBy && 
                                  (typeof event.createdBy === 'object' 
                                    ? event.createdBy._id?.toString() === currentUser._id?.toString()
                                    : event.createdBy?.toString() === currentUser._id?.toString()) && (
                                   <button
                                     onClick={() => handleDeleteEvent(event)}
                                     disabled={deleteEventMutation.isLoading}
                                     className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                     title="Delete event"
                                   >
                                     <Trash2 className="w-4 h-4" />
                                   </button>
                                 )}
                               </div>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/event/${event._id}`);
                              }}
                              className="text-sm text-[#C17D3A] hover:text-[#6B4E00] font-medium transition-colors underline"
                            >
                              View Details
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                                setShowGallery(true);
                              }}
                              className="text-sm text-[#2D1B00] hover:text-[#6B4E00] font-medium transition-colors underline"
                            >
                              View Media
                            </button>
                          </div>

                          {/* Event Reactions Preview */}
                          <EventReactions event={event} />
                    </motion.div>
                  ))
                ) : (
                  <p className="text-[#6B4E00] text-center py-8">No events yet. Create your first event!</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Members and Buzz Chat */}
          <div className="lg:col-span-1 space-y-6">
              <div className="honey-card p-6 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#2D1B00]" />
                    <h2 className="text-[#2D1B00] text-xl font-medium">Members</h2>
                  </div>
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="p-2 text-[#C17D3A] hover:text-[#6B4E00] hover:bg-[rgba(245,230,211,0.6)] rounded-lg transition-colors"
                    title="Add Member"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                </div>
                     <div className="space-y-3">
                       {hive.members && hive.members.map((member) => (
                         <div key={member._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[rgba(245,230,211,0.6)] transition-colors">
                           <div className="w-10 h-10 overflow-hidden flex-shrink-0 rounded-full border-2 border-[#C17D3A]/30">
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
              
              {/* Buzz Chat */}
              <div className="sticky top-4">
                <BuzzChat hiveId={hiveId} />
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

        {/* Add Member Modal */}
        <AnimatePresence>
          {showAddMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddMember(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="honey-card rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#2D1B00] text-xl font-medium">Add Member</h3>
                  <button
                    onClick={() => setShowAddMember(false)}
                    className="text-[#2D1B00] hover:text-[#6B4E00] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#2D1B00] mb-1 font-medium">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                      placeholder="user@example.com"
                      className="w-full px-4 py-2 border border-[#2D1B00]/20 rounded-lg bg-[rgba(255,249,230,0.6)] text-[#2D1B00] focus:outline-none focus:ring-2 focus:ring-[#C17D3A]/50"
                      autoFocus
                    />
                    <p className="mt-2 text-xs text-[#6B4E00]">
                      The user must have a HiveFive account with this email.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowAddMember(false)}
                      className="flex-1 px-4 py-2 border border-[#2D1B00]/20 text-[#2D1B00] rounded-lg hover:bg-[rgba(245,230,211,0.8)] font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddMember}
                      disabled={addMemberMutation.isLoading || !memberEmail.trim()}
                      className="flex-1 px-4 py-2 bg-[rgba(193,125,58,0.8)] hover:bg-[rgba(193,125,58,0.9)] text-[#2D1B00] border border-[#2D1B00]/20 backdrop-blur-sm rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {addMemberMutation.isLoading ? 'Adding...' : 'Add Member'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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

