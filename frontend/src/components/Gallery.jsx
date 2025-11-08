import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import api from '../config/api';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { X, Upload, Star, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Gallery({ hiveId, eventId, onClose }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(null);

  const { data: media, isLoading } = useQuery({
    queryKey: ['media', hiveId, eventId],
    queryFn: async () => {
      const endpoint = eventId ? `/media/event/${eventId}` : `/media/hive/${hiveId}`;
      const response = await api.get(endpoint);
      return response.data;
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, fileType, eventId, caption }) => {
      try {
        // Verify user is authenticated
        const { auth } = await import('../config/firebase');
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          throw new Error('You must be signed in to upload files. Please sign in and try again.');
        }

        // Get fresh auth token
        const token = await currentUser.getIdToken(true);
        console.log('Upload: User authenticated', { uid: currentUser.uid, email: currentUser.email });

        // Upload to Firebase Storage with explicit metadata
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileRef = ref(storage, `hive-media/${hiveId}/${Date.now()}_${sanitizedFileName}`);
        
        // Ensure content type is set correctly - Firebase Storage needs this
        const contentType = file.type || (fileType === 'image' ? 'image/jpeg' : 'video/mp4');
        console.log('Upload: File metadata', { 
          fileName: file.name, 
          contentType, 
          size: file.size,
          path: `hive-media/${hiveId}/${Date.now()}_${sanitizedFileName}`
        });
        
        const metadata = {
          contentType: contentType,
          customMetadata: {
            uploadedBy: currentUser.uid,
            hiveId: hiveId,
            eventId: eventId || 'none',
            uploadedAt: new Date().toISOString()
          }
        };
        
        console.log('Upload: Starting upload...');
        await uploadBytes(fileRef, file, metadata);
        console.log('Upload: Upload successful, getting download URL...');
        const fileURL = await getDownloadURL(fileRef);
        console.log('Upload: Got download URL', fileURL);

        // Upload metadata to backend
        const backendResponse = await api.post('/media', {
          eventID: eventId,
          fileURL,
          fileType,
          caption
        });
        console.log('Upload: Backend metadata saved', backendResponse.data);
        
        return backendResponse;
      } catch (uploadError) {
        console.error('Firebase Storage upload error:', uploadError);
        console.error('Error details:', {
          code: uploadError.code,
          message: uploadError.message,
          stack: uploadError.stack
        });
        
        // Provide more helpful error messages
        if (uploadError.code === 'storage/unauthorized' || uploadError.code === 'storage/permission-denied') {
          throw new Error('Upload failed: Permission denied. The Firebase Storage rules may not be deployed. Please check Firebase Console and deploy storage rules.');
        } else if (uploadError.code === 'storage/quota-exceeded') {
          throw new Error('Upload failed: Storage quota exceeded. Please free up space or upgrade your plan.');
        } else if (uploadError.code === 'storage/invalid-format') {
          throw new Error('Upload failed: Invalid file format. Please upload an image (jpg, png, etc.) or video (mp4, etc.).');
        } else if (uploadError.code === 'auth/user-not-found' || uploadError.code === 'auth/requires-recent-login') {
          throw new Error('Upload failed: Authentication expired. Please sign out and sign back in.');
        }
        throw new Error(uploadError.message || 'Failed to upload file. Please try again.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['media']);
      setUploading(false);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      setUploading(false);
      alert(error.message || 'Failed to upload file. Please try again.');
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ mediaId, text, rating }) => {
      return api.post(`/media/${mediaId}/reviews`, {
        text,
        rating
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['media']);
      setShowReviewForm(null);
      setReviewText('');
      setReviewRating(5);
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileType = file.type.startsWith('image/') ? 'image' : 'video';
    
    uploadMutation.mutate({
      file,
      fileType,
      eventId: eventId || null,
      caption: ''
    });
  };

  const handleSubmitReview = (mediaId) => {
    if (!reviewText.trim()) return;
    
    reviewMutation.mutate({
      mediaId,
      text: reviewText,
      rating: reviewRating
    });
  };

  return (
    <>
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
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {eventId ? 'Event Gallery' : 'Hive Gallery'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Area */}
            <div className="p-6 border-b bg-gray-50">
              <label className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer">
                <Upload className="w-5 h-5" />
                {uploading ? 'Uploading...' : 'Upload Photo/Video'}
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : !media || media.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No media yet. Upload the first photo or video!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {media.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedMedia(item)}
                    >
                      {item.fileType === 'image' || item.fileType === 'livephoto' ? (
                        <img
                          src={item.fileURL}
                          alt={item.caption || 'Gallery item'}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : (
                        <video
                          src={item.fileURL}
                          className="w-full h-48 object-cover rounded-lg"
                          controls
                        />
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-opacity flex items-center justify-center">
                        <p className="text-white opacity-0 group-hover:opacity-100 text-sm px-2 text-center">
                          {item.caption || 'No caption'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Selected Media Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center p-4"
            onClick={() => setSelectedMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {selectedMedia.fileType === 'image' || selectedMedia.fileType === 'livephoto' ? (
                  <img
                    src={selectedMedia.fileURL}
                    alt={selectedMedia.caption}
                    className="w-full max-h-[60vh] object-contain"
                  />
                ) : (
                  <video
                    src={selectedMedia.fileURL}
                    className="w-full max-h-[60vh]"
                    controls
                    autoPlay
                  />
                )}
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-gray-900 font-medium">{selectedMedia.caption}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    By {selectedMedia.uploaderID?.name} • {format(new Date(selectedMedia.timestamp), 'MMM d, yyyy')}
                  </p>
                </div>

                {/* Reviews */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Reviews</h4>
                  {selectedMedia.reviews && selectedMedia.reviews.length > 0 ? (
                    <div className="space-y-2">
                      {selectedMedia.reviews.map((review, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{review.userID?.name}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">{review.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No reviews yet</p>
                  )}
                </div>

                {/* Add Review */}
                {showReviewForm === selectedMedia._id ? (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setReviewRating(rating)}
                          className="p-1"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              rating <= reviewRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Write a review..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      rows="3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSubmitReview(selectedMedia._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        <Send className="w-4 h-4" />
                        Submit
                      </button>
                      <button
                        onClick={() => {
                          setShowReviewForm(null);
                          setReviewText('');
                          setReviewRating(5);
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowReviewForm(selectedMedia._id)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Add Review
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Gallery;

