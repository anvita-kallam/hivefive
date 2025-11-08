import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../config/api';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Users, Plus, LogOut } from 'lucide-react';
import CalendarSync from '../components/CalendarSync';
import SimpleCalendar from '../components/SimpleCalendar';
import FullScreenEventInvites from '../components/FullScreenEventInvites';
import { BeeDecor, BeeLogo } from '../components/BeeDecor.jsx';

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
    <div className="min-h-screen honey-gradient-bg relative overflow-hidden">
      {/* Honeycomb Decorations */}
      <BeeDecor />

      {/* Full Screen Event Invites - Shows first when there are pending events */}
      <FullScreenEventInvites />

      {/* Header */}
      <header className="bg-[rgba(212,165,116,0.8)] backdrop-blur-md border-b border-[#2D1B00]/20 relative z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BeeLogo />
              <div>
                <h1 className="text-[#2D1B00] text-2xl font-medium">HiveFive</h1>
                <p className="text-sm text-[#6B4E00]">Welcome back, {user?.name || user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/edit-profile')}
                className="text-[#2D1B00] hover:text-[#6B4E00] underline transition-colors"
              >
                Edit Profile
              </button>
              <button
                onClick={logout}
                className="bg-[rgba(193,125,58,0.8)] hover:bg-[rgba(193,125,58,0.9)] text-[#2D1B00] border border-[#2D1B00]/20 backdrop-blur-sm px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 relative z-10">
        {/* Calendar Sync */}
        <section className="mb-6">
          <CalendarSync />
        </section>

        {/* Simple Calendar */}
        <section className="mb-6">
          <SimpleCalendar />
        </section>

        {/* Upcoming Events */}
        {events && events.length > 0 && (
          <section className="mb-6">
            <div className="honey-card p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <HexagonIcon />
                <h2 className="text-[#2D1B00] text-xl font-medium">Upcoming Events</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.slice(0, 6).map((event) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[rgba(245,230,211,0.5)] backdrop-blur-sm rounded-lg p-4 border border-[#2D1B00]/20 shadow-md cursor-pointer hover:bg-[rgba(245,230,211,0.6)] transition-colors"
                    onClick={() => navigate(`/hive/${event.hiveID}`)}
                  >
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-[#2D1B00] mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-[#2D1B00] mb-1 font-medium">{event.title}</h4>
                        {event.confirmedTime && (
                          <p className="text-sm text-[#6B4E00] mb-2">
                            {format(new Date(event.confirmedTime), 'MMM d, h:mm a')}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-[#6B4E00]">
                          <Users className="w-4 h-4" />
                          <span>{event.acceptedBy?.length || 0} accepted</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Hives */}
        <section>
          <div className="honey-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <HexagonIcon />
                <h2 className="text-[#2D1B00] text-xl font-medium">My Hives</h2>
              </div>
              <button
                onClick={() => navigate('/create-hive')}
                className="bg-[rgba(245,230,211,0.6)] backdrop-blur-sm hover:bg-[rgba(245,230,211,0.8)] text-[#2D1B00] border border-[#2D1B00]/20 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Hive
              </button>
            </div>

            {!hives || hives.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-[#2D1B00] text-xl font-medium mb-2">No hives yet</h3>
                <p className="text-[#6B4E00] mb-6">Create or join a hive to get started</p>
                <button
                  onClick={() => navigate('/create-hive')}
                  className="bg-[rgba(245,230,211,0.6)] backdrop-blur-sm hover:bg-[rgba(245,230,211,0.8)] text-[#2D1B00] border border-[#2D1B00]/20 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Your First Hive
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hives.map((hive) => (
                  <motion.div
                    key={hive._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[rgba(245,230,211,0.5)] backdrop-blur-sm rounded-lg p-4 border border-[#2D1B00]/20 shadow-md cursor-pointer hover:bg-[rgba(245,230,211,0.6)] transition-colors"
                    onClick={() => navigate(`/hive/${hive._id}`)}
                  >
                    <h3 className="text-[#2D1B00] font-medium mb-2">{hive.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-[#6B4E00] mb-3">
                      <Users className="w-4 h-4" />
                      <span>{hive.members?.length || 0} members</span>
                    </div>
                    
                    {/* Next Event */}
                    {events && events.find(e => e.hiveID === hive._id && e.status === 'confirmed') && (
                      <div className="mt-3 pt-3 border-t border-[#2D1B00]/20">
                        <p className="text-xs text-[#6B4E00] mb-1">Next Event:</p>
                        <p className="text-sm text-[#2D1B00] font-medium">
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
                            className="w-6 h-6 rounded-full border-2 border-[#D4A574]"
                          />
                        ))}
                        {hive.members.length > 5 && (
                          <div className="w-6 h-6 rounded-full border-2 border-[#D4A574] bg-[rgba(193,125,58,0.8)] flex items-center justify-center text-xs text-[#2D1B00] font-medium">
                            +{hive.members.length - 5}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function HexagonIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-[#2D1B00]"
      style={{ color: '#2D1B00' }}
    >
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

export default Dashboard;

