import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { BeeLogo } from '../components/BeeDecor.jsx';

function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setUser({ email: user.email, uid: user.uid });
      
      // Check if user profile exists, if not redirect to creation page
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/auth/me`, {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`
          }
        });
        
        if (response.status === 404) {
          navigate('/create-profile');
        } else if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          navigate('/dashboard');
        } else {
          navigate('/create-profile');
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        navigate('/create-profile');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen honey-gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Flying Bees */}
      <div className="flying-bee flying-bee-1">
        <img src="/cute-bee.png" alt="Flying bee" />
      </div>
      <div className="flying-bee flying-bee-2">
        <img src="/cute-bee.png" alt="Flying bee" />
      </div>
      <div className="flying-bee flying-bee-3">
        <img src="/cute-bee.png" alt="Flying bee" />
      </div>
      <div className="flying-bee flying-bee-4">
        <img src="/cute-bee.png" alt="Flying bee" />
      </div>
      <div className="flying-bee flying-bee-5">
        <img src="/cute-bee.png" alt="Flying bee" />
      </div>
      <div className="flying-bee flying-bee-6">
        <img src="/cute-bee.png" alt="Flying bee" />
      </div>

      <div className="max-w-md w-full honey-card rounded-2xl shadow-xl p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BeeLogo width={64} height={64} />
            <h1 className="honey-text-strong text-4xl mb-2">HiveFive</h1>
          </div>
          <p className="honey-text-subtle">connect with your swarm!</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;

