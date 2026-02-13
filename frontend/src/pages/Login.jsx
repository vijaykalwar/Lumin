import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import { showToast } from '../utils/toast';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ FIX: Destructure from formData
    const { email, password } = formData;

    if (!email || !password) {
      showToast.error('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const result = await authAPI.login(email, password);
      
      if (result.success) {
        login(result.token, result.user, result.refreshToken);
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center py-12 px-4">
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
              <Link to="/forgot-password" className="text-primary-400 hover:text-primary-300 transition">
                Forgot password?
              </Link>
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