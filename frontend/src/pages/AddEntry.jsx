import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { entryAPI } from '../utils/api';
import { sanitizeInput } from '../utils/sanitize';
import Navbar from '../components/Navbar';
import { showToast } from '../utils/toast';
function AddEntry() {
  const [formData, setFormData] = useState({
    mood: '',
    moodEmoji: '',
    moodIntensity: 5,
    title: '',
    notes: '',
    tags: '',
    isPrivate: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [hasEntryToday, setHasEntryToday] = useState(false);

  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Mood options
  const moods = [
    { value: 'amazing', emoji: '🤩', label: 'Amazing' },
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'excited', emoji: '🤗', label: 'Excited' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'anxious', emoji: '😰', label: 'Anxious' },
    { value: 'stressed', emoji: '😫', label: 'Stressed' },
    { value: 'angry', emoji: '😠', label: 'Angry' }
  ];

  useEffect(() => {
    const checkTodayEntry = async () => {
      const result = await entryAPI.getToday();
      if (result.success && result.data?.hasEntryToday) {
        setHasEntryToday(true);
      }
    };
    checkTodayEntry();
  }, []);

  useEffect(() => {
    const words = formData.notes.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  }, [formData.notes]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleMoodSelect = (mood) => {
    setFormData({
      ...formData,
      mood: mood.value,
      moodEmoji: mood.emoji
    });
  };

  
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.mood || !formData.notes.trim()) {
    showToast.error('Please select a mood and write some notes!');
    return;
  }

  const toastId = showToast.loading('Creating your entry...');

  try {
    const payload = {
      ...formData,
      title: sanitizeInput(formData.title || ''),
      notes: sanitizeInput(formData.notes),
      tags: Array.isArray(formData.tags) ? formData.tags.map(sanitizeInput) : (formData.tags || '').split(',').map((t) => sanitizeInput(t.trim())).filter(Boolean),
    };
    const result = await entryAPI.create(payload);
    
    if (result.success) {
      showToast.dismiss(toastId);
      showToast.success(`Entry created successfully! +${result.data.rewards.xp.total} XP`);
      
      // Reset form
      setFormData({
        mood: '',
        moodIntensity: 5,
        title: '',
        notes: '',
        tags: [],
        category: 'personal'
      });
      
      // Navigate back to home/dashboard after a short delay
      setTimeout(() => navigate('/dashboard'), 1200);
    } else {
      showToast.dismiss(toastId);
      showToast.error(result.message || 'Failed to create entry');
    }
  } catch (error) {
    showToast.dismiss(toastId);
    showToast.error('Something went wrong. Please try again.');
  }
};

  if (hasEntryToday) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              You've already journaled today!
            </h2>
            <p className="text-gray-400 mb-6">
              Come back tomorrow to continue your streak.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

 return (
  <div className="min-h-screen bg-white dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
    <div className="max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="text-right flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-1">
            Create New Entry
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Capture your thoughts and feelings
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          
          {/* Mood Selection - Responsive Grid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              How are you feeling?
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                 onClick={() => setFormData({ 
  ...formData, 
  mood: mood.value, 
  moodEmoji: mood.emoji 
})}

                  className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all ${
                    formData.mood === mood.value
                      ? 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title={mood.label}
                >
                  <span className="text-2xl sm:text-3xl">{mood.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
              placeholder="Give your entry a title..."
            />
          </div>

          {/* Notes Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes *
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              required
              rows="8"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm sm:text-base"
              placeholder="Write your thoughts here..."
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            {wordCount} words (min 10 required)
          </p>


          {/* Submit Button - Full width on mobile */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 text-sm sm:text-base font-medium"
          >
            {loading ? 'Creating...' : 'Create Entry'}
          </button>

        </form>
      </div>

    </div>
  </div>
);}
export default AddEntry;