import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../config/api';
import { Calendar, Check } from 'lucide-react';
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

      // Use postMessage instead of checking window.closed to avoid COOP errors
      // Also set a timeout to handle the case where the window is closed manually
      const messageHandler = (event) => {
        // Verify origin for security
        if (event.origin !== window.location.origin) {
          return;
        }
        
        if (event.data === 'calendar-auth-success' || event.data === 'calendar-auth-closed') {
          window.removeEventListener('message', messageHandler);
          if (authWindow) {
            try {
              authWindow.close();
            } catch (e) {
              // Ignore errors when closing window
            }
          }
          setConnecting(false);
          // Refresh user data to check if calendar is connected
          window.location.reload();
        }
      };

      window.addEventListener('message', messageHandler);

      // Fallback: Check if window was closed after a delay (with error handling)
      const checkInterval = setInterval(() => {
        try {
          if (authWindow && authWindow.closed) {
            clearInterval(checkInterval);
            window.removeEventListener('message', messageHandler);
            setConnecting(false);
            // Refresh user data to check if calendar is connected
            window.location.reload();
          }
        } catch (e) {
          // COOP policy blocks access to window.closed, so we ignore the error
          // and rely on postMessage instead
          clearInterval(checkInterval);
        }
      }, 1000);

      // Cleanup after 10 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
        window.removeEventListener('message', messageHandler);
        setConnecting(false);
      }, 600000);
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

export default CalendarSync;

