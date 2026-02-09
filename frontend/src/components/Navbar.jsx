import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Home,
  Target,
  Heart,
  Eye,
  Users,
  Clock,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Flame
} from 'lucide-react';

// ✨ Unique LUMIN Logo Component
const LuminLogo = ({ className = "" }) => (
  <div className={`relative ${className}`}>
    {/* Hexagon Shape with Gradient */}
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="group-hover:scale-110 transition-transform">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Hexagon Background */}
      <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="url(#logoGradient)" />
      {/* Inner Geometric "L" */}
      <path d="M12 10H14V20H20V22H12V10Z" fill="white" fillOpacity="0.95" />
      {/* Accent Spark */}
      <circle cx="22" cy="12" r="2" fill="#fbbf24" className="animate-pulse" />
    </svg>
  </div>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navTabs = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/goals', icon: Target, label: 'Goals' },
    { to: '/entries', icon: Heart, label: 'Journal' },
    { to: '/analytics', icon: Eye, label: 'Vision' },
    { to: '/community', icon: Users, label: 'Social' },
    { to: '/pomodoro', icon: Clock, label: 'Focus' }
  ];

  const isActive = (path) => location.pathname === path;
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const xpProgress = user?.xp ? (user.xp % 100) : 0;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            
            {/* ✨ LOGO - Unique Hexagon Design */}
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <LuminLogo />
              <span 
                className="text-lg font-bold text-white hidden sm:inline"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                LUMIN
              </span>
            </Link>

            {/* Desktop Tabs */}
            <div className="hidden lg:flex items-center gap-1">
              {navTabs.map((tab) => (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive(tab.to)
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800'
                    }
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              
              {/* Streak */}
              <div className="hidden sm:flex items-center gap-2 text-orange-400">
                <Flame className="w-5 h-5" />
                <span className="text-sm font-bold">{user?.streak || 0}</span>
              </div>

              {/* Level Progress */}
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                    {user?.level || 1}
                  </div>
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition-all"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Profile */}
              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">Profile</span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-purple-600 text-white"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={closeMobileMenu}
          />
          <div className="fixed top-14 right-0 bottom-0 w-72 bg-slate-900 border-l border-slate-700 z-50 lg:hidden animate-slideInRight overflow-y-auto">
            <div className="p-4 space-y-2">
              
              {/* User Card */}
              <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl text-white mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold">{user?.name}</p>
                    <p className="text-sm opacity-80">Level {user?.level} • {user?.xp} XP</p>
                  </div>
                </div>
              </div>

              {/* Nav Links */}
              {navTabs.map((tab) => (
                <Link
                  key={tab.to}
                  to={tab.to}
                  onClick={closeMobileMenu}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive(tab.to)
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-slate-800'
                    }
                  `}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </Link>
              ))}

              {/* Additional Links */}
              <Link to="/ai-chat" onClick={closeMobileMenu} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isActive('/ai-chat') ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-slate-800'}`}>
                <Target className="w-5 h-5" />
                <span className="font-medium">AI Chat</span>
              </Link>

              <Link to="/challenges" onClick={closeMobileMenu} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isActive('/challenges') ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-slate-800'}`}>
                <Target className="w-5 h-5" />
                <span className="font-medium">Challenges</span>
              </Link>

              <Link to="/profile" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-slate-800">
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 w-full mt-4"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>

            </div>
          </div>
        </>
      )}
    </>
  );
}