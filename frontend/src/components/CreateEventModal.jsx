import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LocationPicker from './LocationPicker';

function CreateEventModal({ hiveId, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: {
      name: '',
      address: '',
      coordinates: null
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createEventMutation = useMutation({
    mutationFn: async (eventData) => {
      return api.post('/events', {
        ...eventData,
        hiveID: hiveId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events', hiveId]);
      queryClient.invalidateQueries(['hive', hiveId]);
      onClose();
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to create event');
      setLoading(false);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    const eventData = {
      title: formData.title,
      description: formData.description,
      location: formData.location.name || formData.location.address ? formData.location : null
    };

    createEventMutation.mutate(eventData);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Study Session, Game Night, Dinner"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Tell your hive about this event..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Location
              </label>
              <LocationPicker
                onLocationSelect={(location) => {
                  setFormData({
                    ...formData,
                    location: {
                      name: location.name || '',
                      address: location.address || '',
                      coordinates: location.coordinates || null
                    }
                  });
                }}
                initialLocation={formData.location.name || formData.location.address ? formData.location : null}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The Hive Agent will analyze all members' availability and propose optimal times for this event. Members will receive swipe cards to accept or decline.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loading 
                    ? '#D3D3D3' 
                    : 'linear-gradient(135deg, #FFF8DC 0%, #FFEFD5 50%, #FFFACD 100%)',
                  color: '#2D1B00',
                  border: loading ? '1px solid #A0A0A0' : '2px solid rgba(255, 235, 180, 0.5)',
                  boxShadow: loading 
                    ? 'none' 
                    : '0 4px 12px rgba(255, 235, 180, 0.3), 0 2px 6px rgba(255, 218, 185, 0.2)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #FFFEF0 0%, #FFF8E1 50%, #FFFDE7 100%)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 235, 180, 0.4), 0 3px 8px rgba(255, 218, 185, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #FFF8DC 0%, #FFEFD5 50%, #FFFACD 100%)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 235, 180, 0.3), 0 2px 6px rgba(255, 218, 185, 0.2)';
                  }
                }}
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CreateEventModal;

