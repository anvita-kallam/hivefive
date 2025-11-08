import { useState } from 'react';
import { Calendar, Check } from 'lucide-react';
import { motion } from 'framer-motion';

function CalendarSync() {
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleConnectCalendar = () => {
    // Show coming soon message
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Google Calendar Sync</h3>
            <p className="text-sm text-gray-600">
              Sync with Google Calendar coming soon! For now, use the calendar below to manage your events.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleConnectCalendar}
          disabled
          className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-50"
          title="Coming soon - Google Calendar sync requires app verification"
        >
          Connect Calendar
        </button>
      </div>
      
      {showComingSoon && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm"
        >
          Google Calendar integration is coming soon! Use the calendar below to add and manage your events.
        </motion.div>
      )}
    </motion.div>
  );
}

export default CalendarSync;

