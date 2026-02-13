import React, { useState, useEffect } from 'react';
import { entryAPI } from '../utils/api';
import { showToast } from '../utils/toast';
import BottomNav from '../components/BottomNav';
import {
  BookOpen,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  Tag,
  X,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Entries() {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const moods = [
    { value: 'all', label: 'All Moods', emoji: '🎭' },
    { value: 'amazing', label: 'Amazing', emoji: '🤩' },
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'neutral', label: 'Neutral', emoji: '😐' },
    { value: 'sad', label: 'Sad', emoji: '😢' },
    { value: 'angry', label: 'Angry', emoji: '😠' },
    { value: 'anxious', label: 'Anxious', emoji: '😰' },
    { value: 'stressed', label: 'Stressed', emoji: '😓' },
    { value: 'excited', label: 'Excited', emoji: '🤗' }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'personal', label: 'Personal' },
    { value: 'work', label: 'Work' },
    { value: 'health', label: 'Health' },
    { value: 'goals', label: 'Goals' },
    { value: 'gratitude', label: 'Gratitude' },
    { value: 'reflection', label: 'Reflection' },
    { value: 'other', label: 'Other' }
  ];

  // Load entries
  useEffect(() => {
    loadEntries();
  }, []);

  // Apply filters
  useEffect(() => {
    filterEntries();
  }, [entries, searchQuery, selectedMood, selectedCategory, selectedMonth, sortBy]);

  const loadEntries = async () => {
    setLoading(true);
    const result = await entryAPI.getAll();
    if (result.success) {
      setEntries(result.data);
    } else {
      showToast.error('Failed to load entries');
    }
    setLoading(false);
  };

  const filterEntries = () => {
    let filtered = [...entries];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(entry =>
        entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Mood filter
    if (selectedMood !== 'all') {
      filtered = filtered.filter(entry => entry.mood === selectedMood);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(entry => entry.category === selectedCategory);
    }

    // Month filter
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(entry => {
        const entryMonth = new Date(entry.createdAt).getMonth();
        return entryMonth === parseInt(selectedMonth);
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'mood':
          return a.mood.localeCompare(b.mood);
        default:
          return 0;
      }
    });

    setFilteredEntries(filtered);
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    const toastId = showToast.loading('Deleting entry...');
    const result = await entryAPI.delete(entryId);
    
    if (result.success) {
      showToast.dismiss(toastId);
      showToast.success('Entry deleted successfully');
      loadEntries();
    } else {
      showToast.dismiss(toastId);
      showToast.error('Failed to delete entry');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMood('all');
    setSelectedCategory('all');
    setSelectedMonth('all');
    setSortBy('newest');
  };

  const activeFiltersCount = [
    searchQuery.trim() !== '',
    selectedMood !== 'all',
    selectedCategory !== 'all',
    selectedMonth !== 'all'
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            📔 Journal Entries
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} found
          </p>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          
          {/* Search Input */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search entries, tags..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                showFilters
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 bg-white dark:bg-gray-900 text-purple-600 rounded-full text-xs font-bold">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              
              {/* Mood Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mood
                </label>
                <select
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {moods.map(mood => (
                    <option key={mood.value} value={mood.value}>
                      {mood.emoji} {mood.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Months</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="mood">By Mood</option>
                </select>
              </div>

            </div>
          )}

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            </div>
          )}

        </div>

        {/* Entries Grid */}
        {filteredEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => (
              <div
                key={entry._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group"
              >
                {/* Header with Mood & Actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{entry.moodEmoji}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {entry.title || 'Untitled'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/entries/${entry._id}/edit`}
                      className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </Link>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Entry Content */}
                <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                  {entry.notes}
                </p>

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {entry.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                    {entry.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                        +{entry.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                    {entry.category}
                  </span>
                  <span>
                    {entry.wordCount || 0} words
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No entries found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || activeFiltersCount > 0
                ? 'Try adjusting your search or filters'
                : 'Start journaling to see your entries here'
              }
            </p>
            {(searchQuery || activeFiltersCount > 0) && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  );
}