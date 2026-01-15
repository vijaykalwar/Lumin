import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, LogIn } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaFacebook } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../utils/toast';
function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!email || !password) {
    showToast.error('Please enter both email and password');
    return;
  }

  setLoading(true);

  try {
    const result = await authAPI.login(email, password);
    
    if (result.success) {
      login(result.token, result.user);
      showToast.success(`Welcome back, ${result.user.name}! 👋`);
      navigate('/dashboard');
    } else {
      showToast.error(result.message || 'Login failed');
    }
  } catch (error) {
    showToast.error('Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleGoogleLogin = () => {
    alert('Google OAuth coming in Phase 4!');
  };

  const handleAppleLogin = () => {
    alert('Apple Sign-In coming in Phase 4!');
  };

  const handleFacebookLogin = () => {
    alert('Facebook Login coming in Phase 4!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full animate-fadeIn">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full mb-4 shadow-2xl">
            <LogIn size={40} className="text-white" />
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-gray-400">Continue your growth journey</p>
        </div>

        <div className="card">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-lg transition border border-gray-300"
            >
              <FcGoogle size={24} />
              <span>Continue with Google</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleAppleLogin}
                className="flex items-center justify-center space-x-2 bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                <FaApple size={20} />
                <span>Apple</span>
              </button>

              <button 
                onClick={handleFacebookLogin}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                <FaFacebook size={20} />
                <span>Facebook</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-800 text-gray-400">Or with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="input-label flex items-center space-x-2">
                <Mail size={16} />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                name="email"
                className="input-field"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="input-label flex items-center space-x-2">
                <Lock size={16} />
                <span>Password</span>
              </label>
              <input
                type="password"
                name="password"
                className="input-field"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 text-gray-400 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-primary-400 hover:text-primary-300 transition">
                Forgot password?
              </a>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full text-lg group"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="spinner"></span>
                  <span>Logging in...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>Login</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-primary-400 hover:text-primary-300 font-semibold transition"
            >
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;