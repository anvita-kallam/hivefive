import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../config/api';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Users, Plus, LogOut, Hexagon } from 'lucide-react';
import CalendarSync from '../components/CalendarSync';
import SimpleCalendar from '../components/SimpleCalendar';
import FullScreenEventInvites from '../components/FullScreenEventInvites';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const { data: hives, isLoading } = useQuery({
    queryKey: ['hives'],
    queryFn: async () => {
      const response = await api.get('/hives');
      return response.data;
    }
  });

  const { data: events } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      if (!hives || hives.length === 0) return [];
      
      // Get events for all hives
      const eventPromises = hives.map(hive => 
        api.get(`/events/hive/${hive._id}`).then(res => res.data)
      );
      const eventsArrays = await Promise.all(eventPromises);
      return eventsArrays.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    enabled: !!hives
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen honey-gradient-bg honeycomb-pattern">
      {/* Full Screen Event Invites - Shows first when there are pending events */}
      <FullScreenEventInvites />

      {/* Header */}
      <header className="bg-gradient-to-r from-honey-light via-honey-gold to-honey-amber shadow-lg border-b-4 border-honey-brown">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Hexagon className="w-8 h-8 text-honey-brown bee-icon" />
              <div>
                <h1 className="text-3xl font-bold honey-text text-honey-brown">HiveFive</h1>
                <p className="text-sm text-honey-brown font-medium">Welcome back, {user?.name || user?.email}</p>
              </div>
              {user?.profilePhoto && (
                <div className="buzz-hover">
                  <img
                    src={user.profilePhoto}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-4 border-honey-gold shadow-honey"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/edit-profile')}
                className="buzz-hover px-4 py-2 bg-honey-gold text-honey-brown rounded-lg font-semibold shadow-honey hover:bg-honey-amber transition-colors"
              >
                Edit Profile
              </button>
              <button
                onClick={logout}
                className="buzz-hover flex items-center gap-2 px-4 py-2 bg-honey-brown text-white rounded-lg hover:bg-honey-dark transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calendar Sync */}
        <section className="mb-8">
          <CalendarSync />
        </section>

        {/* Simple Calendar */}
        <section className="mb-8">
          <SimpleCalendar />
        </section>

        {/* Upcoming Events */}
        {events && events.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Hexagon className="w-6 h-6 text-honey-brown bee-icon" />
              <h2 className="text-2xl font-bold honey-text text-honey-brown">Upcoming Events</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.slice(0, 6).map((event) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="honey-card buzz-hover p-4 cursor-pointer"
                  onClick={() => navigate(`/hive/${event.hiveID}`)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-honey-brown" />
                    <span className="text-sm font-semibold text-honey-brown">{event.title}</span>
                  </div>
                  {event.confirmedTime && (
                    <p className="text-sm text-honey-amber-dark mb-2 font-medium">
                      {format(new Date(event.confirmedTime), 'MMM d, h:mm a')}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-honey-brown">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">{event.acceptedBy?.length || 0} accepted</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Hives */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Hexagon className="w-6 h-6 text-honey-brown bee-icon" />
              <h2 className="text-2xl font-bold honey-text text-honey-brown">My Hives</h2>
            </div>
            <button
              onClick={() => navigate('/create-hive')}
              className="honey-drop-button buzz-hover flex items-center gap-2"
            >
              <Plus className="w-6 h-6" />
              <Hexagon className="w-5 h-5" />
              Create Hive
            </button>
          </div>

          {!hives || hives.length === 0 ? (
            <div className="honey-card p-12 text-center">
              <Hexagon className="w-20 h-20 text-honey-brown mx-auto mb-4 bee-icon" />
              <h3 className="text-2xl font-bold honey-text text-honey-brown mb-2">No hives yet</h3>
              <p className="text-honey-amber-dark mb-6 font-medium">Create or join a hive to get started</p>
              <button
                onClick={() => navigate('/create-hive')}
                className="honey-drop-button buzz-hover"
              >
                <Hexagon className="w-5 h-5 inline mr-2" />
                Create Your First Hive
              </button>
            </div>
          ) : (
            <div className="honeycomb-container">
              {hives.map((hive) => (
                <motion.div
                  key={hive._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="buzz-hover"
                  onClick={() => navigate(`/hive/${hive._id}`)}
                >
                  <div className="hexagon">
                    <div className="hexagon-content">
                      <Hexagon className="w-8 h-8 text-honey-brown mb-2 bee-icon" />
                      <h3 className="text-lg font-bold honey-text text-honey-brown mb-2 text-center">{hive.name}</h3>
                      <div className="flex items-center gap-2 text-honey-amber-dark mb-3">
                        <Users className="w-4 h-4" />
                        <span className="font-semibold">{hive.members?.length || 0} members</span>
                      </div>
                      
                      {/* Next Event */}
                      {events && events.find(e => e.hiveID === hive._id && e.status === 'confirmed') && (
                        <div className="mt-2 pt-2 border-t border-honey-brown border-opacity-30 w-full">
                          <p className="text-xs text-honey-amber-dark font-semibold">Next Event:</p>
                          <p className="text-xs font-bold text-honey-brown">
                            {events.find(e => e.hiveID === hive._id && e.status === 'confirmed')?.title}
                          </p>
                        </div>
                      )}

                      {/* Member Avatars */}
                      {hive.members && hive.members.length > 0 && (
                        <div className="flex -space-x-2 mt-3">
                          {hive.members.slice(0, 5).map((member) => (
                            <img
                              key={member._id}
                              src={member.profilePhoto || `https://ui-avatars.com/api/?name=${member.name}`}
                              alt={member.name}
                              className="w-6 h-6 rounded-full border-2 border-honey-gold"
                            />
                          ))}
                          {hive.members.length > 5 && (
                            <div className="w-6 h-6 rounded-full border-2 border-honey-gold bg-honey-amber flex items-center justify-center text-xs text-honey-brown font-bold">
                              +{hive.members.length - 5}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;

