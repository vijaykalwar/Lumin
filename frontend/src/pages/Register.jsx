import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import { showToast } from '../utils/toast';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
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
    const { name, email, password } = formData;

    if (!name || !email || !password) {
      showToast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      showToast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await authAPI.register(name, email, password);
      
      if (result.success) {
        login(result.token, result.user, result.refreshToken);
        showToast.success('🎉 Welcome to LUMIN! Let\'s start your journey!');
        navigate('/dashboard');
      } else {
        showToast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      showToast.error('Registration failed. Please try again.');
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
            <User size={40} className="text-white" />
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-400">
            Start your growth journey with LUMIN
          </p>
        </div>

        <div className="card">

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Input */}
            <div>
              <label className="input-label flex items-center space-x-2">
                <User size={16} />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                name="name"
                className="input-field"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email Input */}
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

            {/* Password Input */}
            <div>
              <label className="input-label flex items-center space-x-2">
                <Lock size={16} />
                <span>Password</span>
              </label>
              <input
                type="password"
                name="password"
                className="input-field"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
                <Lock size={12} />
                <span>Must be at least 6 characters</span>
              </p>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn-primary w-full text-lg group"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="spinner"></span>
                  <span>Creating Account...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>Create Account</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-400 mt-6">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-primary-400 hover:text-primary-300 font-semibold transition"
            >
              Login here
            </Link>
          </p>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By continuing, you agree to LUMIN's{' '}
          <a href="#" className="text-primary-400 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-primary-400 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

export default Register;