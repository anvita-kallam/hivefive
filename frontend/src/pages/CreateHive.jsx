import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../config/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Plus, X } from 'lucide-react';

function CreateHive() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    memberEmails: [],
    activityFrequency: 'weekly'
  });
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    }
  });

  const createHiveMutation = useMutation({
    mutationFn: async (hiveData) => {
      return api.post('/hives', hiveData);
    },
    onSuccess: (data) => {
      navigate(`/hive/${data.data._id}`);
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to create hive');
      setLoading(false);
    }
  });

  const handleAddEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (email && email.includes('@') && !formData.memberEmails.includes(email)) {
      setFormData(prev => ({
        ...prev,
        memberEmails: [...prev.memberEmails, email]
      }));
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (email) => {
    setFormData(prev => ({
      ...prev,
      memberEmails: prev.memberEmails.filter(e => e !== email)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Hive name is required');
      return;
    }

    setLoading(true);
    setError('');

    createHiveMutation.mutate({
      name: formData.name,
      memberEmails: formData.memberEmails,
      activityFrequency: formData.activityFrequency
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-primary-900">Create New Hive</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hive Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hive Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Study Group, Roommates, D&D Party"
              />
            </div>

            {/* Activity Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Frequency
              </label>
              <select
                value={formData.activityFrequency}
                onChange={(e) => setFormData({ ...formData, activityFrequency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="spontaneous">Spontaneous</option>
              </select>
            </div>

            {/* Add Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Members (by email)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEmail())}
                  placeholder="Enter email address"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddEmail}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {formData.memberEmails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-700">{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                You'll be automatically added as a member. Other members will receive an invitation.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create Hive'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default CreateHive;

