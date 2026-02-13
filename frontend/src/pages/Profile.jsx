import React, { useState, useEffect } from 'react';
import { profileAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import {User,Mail,MapPin,Briefcase,Calendar,Edit2,
  Save, X,Lock, Settings,Trophy,TrendingUp,Target,Clock,Award, Loader2} from 'lucide-react';
import { showToast } from '../utils/toast';
import Dashboard from "./Dashboard";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
 

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    occupation: '',
    dateOfBirth: ''
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    dailyReminder: true,
    reminderTime: '09:00',
    theme: 'system'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [saveLoading, setSaveLoading] = useState(false);

  // Load profile and stats
  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const result = await profileAPI.getProfile();
    if (result.success) {
      setProfile(result.data);
      setFormData({
        name: result.data.name || '',
        bio: result.data.bio || '',
        location: result.data.location || '',
        occupation: result.data.occupation || '',
        dateOfBirth: result.data.dateOfBirth ? result.data.dateOfBirth.split('T')[0] : ''
      });
      setSettings(result.data.settings || settings);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    const result = await profileAPI.getStats();
    if (result.success) {
      setStats(result.data);
    }
  };

  // Handle profile update

const handleSaveProfile = async () => {
  setSaveLoading(true);
  const result = await profileAPI.updateProfile(formData);
  
  if (result.success) {
    showToast.success('✅ Profile updated successfully!');
    setProfile(result.data);
    updateUser(result.data);
    setEditing(false);
  } else {
    showToast.error(result.message || 'Failed to update profile');
  }
  setSaveLoading(false);
};



  // Handle settings update
  const handleSaveSettings = async () => {
    setSaveLoading(true);
    const result = await profileAPI.updateSettings(settings);
    
    if (result.success) {
      showToast.success('⚙️ Settings updated successfully!');
    } else {
      showToast.error(result.message || 'Failed to update settings');
    }
    setSaveLoading(false);
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
       showToast.error('Passwords do not match!');
      return;
    }

    setSaveLoading(true);
    const result = await profileAPI.changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    
    if (result.success) {
       showToast.success('🔒 Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      showToast.error(result.message || 'Failed to change password');
    }
    setSaveLoading(false);
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast.error('Please upload an image file');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Image size should be less than 5MB');
      return;
    }

    setSaveLoading(true);
    const result = await profileAPI.uploadAvatar(file);
    
    if (result.success) {
      showToast.success('✅ Avatar uploaded successfully!');
      setProfile(result.data.user);
      updateUser(result.data.user);
      // Reload profile to get updated data
      await loadProfile();
    } else {
      showToast.error(result.message || 'Failed to upload avatar');
    }
    setSaveLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'stats', label: 'Statistics', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'security', label: 'Security', icon: Lock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Avatar & Basic Info */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                
                {/* Avatar */}
                <div className="text-center mb-6">
                  <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-500 group cursor-pointer">
                    <img
                      src={profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.name}&background=random`}                     
                      alt={profile?.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Edit2 className="w-6 h-6 text-white" />
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarUpload}
                      disabled={saveLoading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                    {profile?.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">{profile?.email}</p>
                </div>

                {/* Level & XP */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Level {profile?.level}</span>
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="bg-white/20 rounded-full h-2 mb-2">
                    <div
                      className="bg-white rounded-full h-2"
                      style={{ width: `${(profile?.xp % 100)}%` }}
                    />
                  </div>
                  <p className="text-sm">{profile?.xp} XP</p>
                </div>

                {/* Streak */}
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {profile?.streak} days 🔥
                      </p>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Badges ({profile?.badges?.length || 0})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile?.badges?.map((badge, index) => (
                      <div
                        key={index}
                        className="bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full text-sm font-medium text-yellow-700 dark:text-yellow-300"
                      >
                        🏆 {badge.displayName}
                      </div>
                    ))}
                    {profile?.badges?.length === 0 && (
                      <p className="text-sm text-gray-500">No badges yet. Keep going!</p>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column - Profile Details */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                
                {/* Edit Button */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    Profile Information
                  </h3>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saveLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {saveLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          loadProfile();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!editing}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!editing}
                      rows="3"
                      maxLength="500"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      disabled={!editing}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                      placeholder="City, Country"
                    />
                  </div>

                  {/* Occupation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Briefcase className="w-4 h-4 inline mr-2" />
                      Occupation
                    </label>
                    <input
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      disabled={!editing}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                      placeholder="Your profession"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      disabled={!editing}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                  </div>

                </div>

              </div>
            </div>

          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Entries */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Edit2 className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-3xl font-bold text-gray-800 dark:text-white">
                  {stats.totalEntries}
                </span>
              </div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Total Entries</h3>
              <p className="text-sm text-gray-500">Journal entries created</p>
            </div>

 {/* Active Goals */}
<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
  <div className="flex items-center justify-between mb-4">
    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
      <Target className="w-6 h-6 text-blue-600" />
    </div>
    <span className="text-3xl font-bold text-gray-800 dark:text-white">
      {stats.activeGoals}
    </span>
  </div>
  <h3 className="font-semibold text-gray-700 dark:text-gray-300">Active Goals</h3>
  <p className="text-sm text-gray-500">Goals in progress</p>
</div>

{/* Completed Goals */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-gray-800 dark:text-white">
              {stats.completedGoals}
            </span>
          </div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">Completed Goals</h3>
          <p className="text-sm text-gray-500">Goals achieved</p>
        </div>

        {/* Pomodoro Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-3xl font-bold text-gray-800 dark:text-white">
              {stats.totalPomodoros}
            </span>
          </div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">Pomodoro Sessions</h3>
          <p className="text-sm text-gray-500">Focus sessions completed</p>
        </div>

      </div>
    )}

    {/* Settings Tab */}
    {activeTab === 'settings' && (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Preferences</h3>
        
        <div className="space-y-6">
          
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Email Notifications</h4>
              <p className="text-sm text-gray-500">Receive updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Daily Reminder */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Daily Reminder</h4>
              <p className="text-sm text-gray-500">Get reminded to journal daily</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dailyReminder}
                onChange={(e) => setSettings({ ...settings, dailyReminder: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Reminder Time */}
          {settings.dailyReminder && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reminder Time
              </label>
              <input
                type="time"
                value={settings.reminderTime}
                onChange={(e) => setSettings({ ...settings, reminderTime: e.target.value })}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            disabled={saveLoading}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {saveLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Save Settings'
            )}
          </button>

        </div>
      </div>
    )}

    {/* Security Tab */}
    {activeTab === 'security' && (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Change Password</h3>
        
        <form onSubmit={handleChangePassword} className="space-y-4">
          
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              required
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
              minLength="6"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              required
              minLength="6"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saveLoading}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {saveLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Change Password'
            )}
          </button>

        </form>
      </div>
    )}

  </div>
</div>
);
}