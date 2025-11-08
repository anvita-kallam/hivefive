import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../config/api';

export const useAuthStore = create((set) => {
  // Initialize auth state listener
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        // Get user data from backend
        const response = await api.get('/auth/me');
        set({ user: response.data, loading: false });
      } catch (error) {
        // User might not exist in backend yet
        set({ user: { email: firebaseUser.email, uid: firebaseUser.uid }, loading: false });
      }
    } else {
      set({ user: null, loading: false });
    }
  });

  return {
    user: null,
    loading: true,
    setUser: (user) => set({ user }),
    logout: async () => {
      await auth.signOut();
      set({ user: null });
    },
  };
});

