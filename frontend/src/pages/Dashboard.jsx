import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../config/api';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Users, Plus, LogOut } from 'lucide-react';
import CalendarSync from '../components/CalendarSync';
import SimpleCalendar from '../components/SimpleCalendar';

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-primary-900">HiveFive</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name || user?.email}</p>
              </div>
              {user?.profilePhoto && (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/edit-profile')}
                className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                Edit Profile
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900"
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.slice(0, 6).map((event) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/hive/${event.hiveID}`)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    <span className="text-sm font-medium text-gray-900">{event.title}</span>
                  </div>
                  {event.confirmedTime && (
                    <p className="text-sm text-gray-600 mb-2">
                      {format(new Date(event.confirmedTime), 'MMM d, h:mm a')}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users className="w-3 h-3" />
                    <span>{event.acceptedBy?.length || 0} accepted</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Hives */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Hives</h2>
            <button
              onClick={() => navigate('/create-hive')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              Create Hive
            </button>
          </div>

          {!hives || hives.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hives yet</h3>
              <p className="text-gray-600 mb-6">Create or join a hive to get started</p>
              <button
                onClick={() => navigate('/create-hive')}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Create Your First Hive
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hives.map((hive) => (
                <motion.div
                  key={hive._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/hive/${hive._id}`)}
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{hive.name}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Users className="w-4 h-4" />
                    <span>{hive.members?.length || 0} members</span>
                  </div>
                  
                  {/* Next Event */}
                  {events && events.find(e => e.hiveID === hive._id && e.status === 'confirmed') && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">Next Event:</p>
                      <p className="text-sm font-medium text-gray-900">
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
                          className="w-8 h-8 rounded-full border-2 border-white"
                        />
                      ))}
                      {hive.members.length > 5 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                          +{hive.members.length - 5}
                        </div>
                      )}
                    </div>
                  )}
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

