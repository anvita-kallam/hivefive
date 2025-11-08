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
      <header className="shadow-lg border-b relative z-20" style={{ background: 'rgba(255, 255, 255, 0.3)', borderColor: 'rgba(255, 220, 150, 0.3)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', borderBottomWidth: '1px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Hexagon className="w-8 h-8 bee-icon" style={{ color: '#4A2C2A' }} />
              <div>
                <h1 className="text-3xl font-bold honey-text" style={{ color: '#4A2C2A' }}>HiveFive</h1>
                <p className="text-sm font-medium" style={{ color: '#4A2C2A' }}>Welcome back, {user?.name || user?.email}</p>
              </div>
              {user?.profilePhoto && (
                <div className="buzz-hover">
                  <img
                    src={user.profilePhoto}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-4"
                    style={{ borderColor: '#FFC30B', boxShadow: '0 4px 15px rgba(255, 195, 11, 0.4)' }}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/edit-profile')}
                className="buzz-hover px-4 py-2 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: '#FFC30B', color: '#4A2C2A', boxShadow: '0 4px 15px rgba(255, 195, 11, 0.4)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF8C00'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFC30B'}
              >
                Edit Profile
              </button>
              <button
                onClick={logout}
                className="buzz-hover flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: '#4A2C2A', color: 'white' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8B4513'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4A2C2A'}
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
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
              <Hexagon className="w-6 h-6 bee-icon" style={{ color: '#4A2C2A' }} />
              <h2 className="text-2xl font-bold honey-text" style={{ color: '#4A2C2A' }}>Upcoming Events</h2>
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
                    <Calendar className="w-5 h-5" style={{ color: '#4A2C2A' }} />
                    <span className="text-sm font-semibold" style={{ color: '#4A2C2A' }}>{event.title}</span>
                  </div>
                  {event.confirmedTime && (
                    <p className="text-sm mb-2 font-medium" style={{ color: '#D2691E' }}>
                      {format(new Date(event.confirmedTime), 'MMM d, h:mm a')}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#4A2C2A' }}>
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
              <Hexagon className="w-6 h-6 bee-icon" style={{ color: '#4A2C2A' }} />
              <h2 className="text-2xl font-bold honey-text" style={{ color: '#4A2C2A' }}>My Hives</h2>
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
              <Hexagon className="w-20 h-20 mx-auto mb-4 bee-icon" style={{ color: '#4A2C2A' }} />
              <h3 className="text-2xl font-bold honey-text mb-2" style={{ color: '#4A2C2A' }}>No hives yet</h3>
              <p className="mb-6 font-medium" style={{ color: '#D2691E' }}>Create or join a hive to get started</p>
              <button
                onClick={() => navigate('/create-hive')}
                className="honey-drop-button buzz-hover"
              >
                <Hexagon className="w-5 h-5 inline mr-2" />
                Create Your First Hive
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
              {hives.map((hive) => (
                <motion.div
                  key={hive._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="buzz-hover max-w-xs mx-auto"
                  onClick={() => navigate(`/hive/${hive._id}`)}
                >
                  <div className="honey-card p-6 rounded-2xl min-h-[200px] flex flex-col items-center justify-center">
                    <Hexagon className="w-12 h-12 mb-3 bee-icon" style={{ color: '#4A2C2A' }} />
                    <h3 className="text-xl font-bold honey-text text-center mb-3" style={{ color: '#4A2C2A' }}>{hive.name}</h3>
                    <div className="flex items-center gap-2 mb-4" style={{ color: '#D2691E' }}>
                      <Users className="w-5 h-5" />
                      <span className="font-semibold text-lg">{hive.members?.length || 0} members</span>
                    </div>
                    
                    {/* Next Event */}
                    {events && events.find(e => e.hiveID === hive._id && e.status === 'confirmed') && (
                      <div className="mt-3 pt-3 border-t w-full" style={{ borderColor: 'rgba(74, 44, 42, 0.3)' }}>
                        <p className="text-sm font-semibold mb-1" style={{ color: '#D2691E' }}>Next Event:</p>
                        <p className="text-sm font-bold" style={{ color: '#4A2C2A' }}>
                          {events.find(e => e.hiveID === hive._id && e.status === 'confirmed')?.title}
                        </p>
                      </div>
                    )}

                    {/* Member Avatars */}
                    {hive.members && hive.members.length > 0 && (
                      <div className="flex -space-x-2 mt-4">
                        {hive.members.slice(0, 5).map((member) => (
                          <img
                            key={member._id}
                            src={member.profilePhoto || `https://ui-avatars.com/api/?name=${member.name}`}
                            alt={member.name}
                            className="w-8 h-8 rounded-full border-2"
                            style={{ borderColor: '#FFC30B' }}
                          />
                        ))}
                        {hive.members.length > 5 && (
                          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold" style={{ borderColor: '#FFC30B', backgroundColor: '#FF8C00', color: '#4A2C2A' }}>
                            +{hive.members.length - 5}
                          </div>
                        )}
                      </div>
                    )}
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

