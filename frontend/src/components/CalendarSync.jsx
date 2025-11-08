import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../config/api';
import { Calendar, Check, Hexagon } from 'lucide-react';
import { motion } from 'framer-motion';

function CalendarSync() {
  const [connecting, setConnecting] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    }
  });

  const handleConnectCalendar = async () => {
    try {
      setConnecting(true);
      const response = await api.get('/calendar/auth-url');
      const { url } = response.data;
      
      // Open OAuth window
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const authWindow = window.open(
        url,
        'Google Calendar Auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for callback (in production, this would be handled server-side)
      const checkInterval = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(checkInterval);
          setConnecting(false);
          // Refresh user data to check if calendar is connected
          window.location.reload();
        }
      }, 1000);
    } catch (error) {
      console.error('Error connecting calendar:', error);
      setConnecting(false);
      alert('Failed to connect calendar. Note: Google Calendar integration requires app verification. For now, use the calendar below to manage your events.');
    }
  };

  const isConnected = user?.googleCalendarRefreshToken;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="honey-card p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Hexagon className="w-6 h-6 text-honey-brown bee-icon" />
          <Calendar className="w-6 h-6 text-honey-amber" />
          <div>
            <h3 className="font-bold honey-text text-honey-brown">Google Calendar Sync</h3>
            <p className="text-sm text-honey-amber-dark font-medium">
              {isConnected 
                ? 'Connected - Your availability will be used for event planning'
                : 'Connect to sync your calendar. Note: Requires Google app verification. Use the calendar below to manage events in the meantime.'}
            </p>
          </div>
        </div>
        
        {isConnected ? (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="w-5 h-5" />
            <span className="font-bold">Connected</span>
          </div>
        ) : (
          <button
            onClick={handleConnectCalendar}
            disabled={connecting}
            className="buzz-hover px-4 py-2 bg-honey-gold text-honey-brown rounded-lg hover:bg-honey-amber disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-honey border-2 border-honey-brown"
          >
            {connecting ? 'Connecting...' : 'Connect Calendar'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default CalendarSync;

