import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../config/api';

export const useAuthStore = create((set) => {
  // Set up auth state listener
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const token = await firebaseUser.getIdToken();
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        set({ user: response.data, loading: false });
      } catch (error) {
        // User doesn't exist in backend yet
        set({ 
          user: { email: firebaseUser.email, uid: firebaseUser.uid }, 
          loading: false 
        });
      }
    } else {
      set({ user: null, loading: false });
    }
  });

  // Initial state - check if user is already signed in
  const currentUser = auth.currentUser;
  const initialState = {
    user: currentUser ? { email: currentUser.email, uid: currentUser.uid } : null,
    loading: !currentUser, // Only loading if no current user (Firebase will update)
  };

  // If no current user, set a timeout to stop loading after 1.5 seconds
  if (!currentUser) {
    setTimeout(() => {
      set((state) => {
        if (state.loading) {
          return { loading: false };
        }
        return state;
      });
    }, 1500);
  }

  return {
    ...initialState,
    setUser: (user) => set({ user, loading: false }),
    logout: async () => {
      await auth.signOut();
      set({ user: null, loading: false });
    },
  };
});
