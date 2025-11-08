import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import api from '../config/api';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';

function EditProfile() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    school: '',
    major: '',
    hobbies: [],
    resHall: '',
    hometown: '',
    birthday: '',
    profilePhoto: null
  });
  const [hobbyInput, setHobbyInput] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch current user data
  const { data: currentUser, isLoading, error: userError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const response = await api.get('/auth/me');
        return response.data;
      } catch (error) {
        // If 404, user doesn't exist in backend yet
        if (error.response?.status === 404) {
          throw new Error('Profile not found. Please create a profile first.');
        }
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000 // Cache for 30 seconds
  });

  // Load user data into form
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        school: currentUser.school || '',
        major: currentUser.major || '',
        hobbies: currentUser.hobbies || [],
        resHall: currentUser.resHall || '',
        hometown: currentUser.hometown || '',
        birthday: currentUser.birthday ? new Date(currentUser.birthday).toISOString().split('T')[0] : '',
        profilePhoto: currentUser.profilePhoto || null
      });
      if (currentUser.profilePhoto) {
        setPhotoPreview(currentUser.profilePhoto);
      }
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddHobby = () => {
    if (hobbyInput.trim() && !formData.hobbies.includes(hobbyInput.trim())) {
      setFormData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, hobbyInput.trim()]
      }));
      setHobbyInput('');
    }
  };

  const handleRemoveHobby = (hobby) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter(h => h !== hobby)
    }));
  };

  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      const { auth } = await import('../config/firebase');
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('Session expired. Please sign in again.');
      }

      const token = await firebaseUser.getIdToken(true);
      
      // Get user ID from query data, auth store, or fetch it
      let userId = currentUser?._id || user?._id;
      
      // If still no user ID, try to fetch current user data
      if (!userId) {
        try {
          const response = await api.get('/auth/me');
          userId = response.data?._id;
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      }
      
      if (!userId) {
        throw new Error('User data not loaded. Please refresh the page or sign in again.');
      }
      
      return api.put(`/users/${userId}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    },
    onSuccess: (response) => {
      // Update auth store with new user data
      useAuthStore.getState().setUser(response.data);
      queryClient.invalidateQueries(['currentUser']);
      navigate('/dashboard');
    },
    onError: (err) => {
      console.error('Error updating profile:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update profile';
      setError(errorMessage);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check Firebase auth first (more reliable)
      const { auth } = await import('../config/firebase');
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        setError('Session expired. Please sign in again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // Check if we have user data loaded
      if (!currentUser && !user?._id) {
        setError('Loading user data... Please wait a moment and try again.');
        setLoading(false);
        // Wait a bit for the query to complete
        setTimeout(() => {
          if (currentUser || user?._id) {
            handleSubmit(e);
          } else {
            setError('User data not found. Please refresh the page.');
          }
        }, 1000);
        return;
      }

      let profilePhotoURL = formData.profilePhoto;

      // Upload new photo if selected
      if (photoFile && firebaseUser.uid) {
        try {
          const photoRef = ref(storage, `profile-photos/${firebaseUser.uid}/${Date.now()}`);
          await uploadBytes(photoRef, photoFile);
          profilePhotoURL = await getDownloadURL(photoRef);
        } catch (uploadError) {
          console.warn('Photo upload failed, keeping existing photo:', uploadError);
        }
      }

      // Update user profile
      updateMutation.mutate({
        name: formData.name,
        school: formData.school,
        major: formData.major,
        hobbies: formData.hobbies,
        resHall: formData.resHall,
        hometown: formData.hometown,
        birthday: formData.birthday || null,
        profilePhoto: profilePhotoURL
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show error if user data couldn't be loaded
  if (!currentUser && !isLoading && userError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
            <p className="text-gray-600 mb-6">
              {userError.message || 'Unable to load your profile. Please create a profile first.'}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-primary-900">Edit Profile</h1>
              <p className="text-gray-600">Update your profile information</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-primary-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No photo</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* School */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School
              </label>
              <input
                type="text"
                value={formData.school || ''}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                placeholder="Enter your school"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Major */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Major
              </label>
              <input
                type="text"
                name="major"
                value={formData.major}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Hobbies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hobbies
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={hobbyInput}
                  onChange={(e) => setHobbyInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHobby())}
                  placeholder="Add a hobby"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddHobby}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.hobbies.map((hobby) => (
                  <span
                    key={hobby}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                  >
                    {hobby}
                    <button
                      type="button"
                      onClick={() => handleRemoveHobby(hobby)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Residence Hall */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Residence Hall
              </label>
              <input
                type="text"
                name="resHall"
                value={formData.resHall}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Hometown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hometown
              </label>
              <input
                type="text"
                name="hometown"
                value={formData.hometown}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birthday
              </label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name}
                className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default EditProfile;

