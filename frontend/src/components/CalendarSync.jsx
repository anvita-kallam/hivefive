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
      className="honey-card p-6 mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HexagonIcon />
          <Calendar className="w-5 h-5 text-[#2D1B00]" />
          <div>
            <h3 className="text-[#2D1B00] font-medium">Google Calendar Sync</h3>
            <p className="text-sm text-[#6B4E00]">
              {isConnected
                ? 'Connected - Your availability will be used for event planning'
                : 'Connect to sync your calendar. Note: Requires Google app verification. Use the calendar below to manage events in the meantime.'}
            </p>
          </div>
        </div>

        {isConnected ? (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="w-5 h-5" />
            <span className="font-medium">Connected</span>
          </div>
        ) : (
          <button
            onClick={handleConnectCalendar}
            disabled={connecting}
            className="bg-[rgba(245,230,211,0.6)] backdrop-blur-sm hover:bg-[rgba(245,230,211,0.8)] text-[#2D1B00] border border-[#2D1B00]/20 px-4 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {connecting ? 'Connecting...' : 'Connect Calendar'}
          </button>
        )}
      </div>
    </motion.div>
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
      <path
        d="M 10 0 L 20 5 L 20 15 L 10 20 L 0 15 L 0 5 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default CalendarSync;

