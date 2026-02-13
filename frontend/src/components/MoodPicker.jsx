import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Mood Picker Component
 * Quick mood selection widget with 8 mood options
 */
const MoodPicker = ({ onMoodSelect }) => {
  const [selectedMood, setSelectedMood] = useState(null);

  const moods = [
    { id: 'happy', emoji: '😊', label: 'Happy', color: '#fbbf24' }, // --neon-yellow
    { id: 'calm', emoji: '😌', label: 'Calm', color: '#06b6d4' }, // --neon-cyan
    { id: 'thoughtful', emoji: '🤔', label: 'Thoughtful', color: '#a855f7' }, // --neon-purple
    { id: 'frustrated', emoji: '😠', label: 'Frustrated', color: '#f97316' }, // --neon-orange
    { id: 'sad', emoji: '😢', label: 'Sad', color: '#ec4899' }, // --neon-pink
    { id: 'tired', emoji: '😴', label: 'Tired', color: '#6b7280' }, // --muted-foreground
    { id: 'motivated', emoji: '🔥', label: 'Motivated', color: '#f97316' }, // --neon-orange
    { id: 'anxious', emoji: '😰', label: 'Anxious', color: '#ec4899' }, // --neon-pink
  ];

  const handleMoodClick = (mood) => {
    setSelectedMood(mood.id);
    if (onMoodSelect) {
      onMoodSelect(mood);
    }
  };

  return (
    <div className="card-glass p-6 space-y-4 animate-fadeIn">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          How are you feeling?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select your current mood
        </p>
      </div>

      {/* Mood Grid */}
      <div className="flex flex-wrap gap-2">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => handleMoodClick(mood)}
            className={`p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
              selectedMood === mood.id
                ? 'border-purple-500 bg-purple-500/10 shadow-md'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            style={{
              boxShadow: selectedMood === mood.id ? `0 0 16px ${mood.color}30` : undefined
            }}
            title={mood.label}
          >
            <span className="text-2xl">{mood.emoji}</span>
          </button>
        ))}
      </div>

      {/* Quick Entry Button (shows after selection) */}
      {selectedMood && (
        <Link
          to="/journal"
          className="block w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl text-center hover:opacity-90 transition-opacity animate-fadeIn"
        >
          Quick Entry →
        </Link>
      )}

      {/* Mood Labels (small text below) */}
      <div className="text-xs text-gray-500 dark:text-gray-500 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
        {selectedMood ? (
          <span className="font-medium">
            Selected: {moods.find(m => m.id === selectedMood)?.label}
          </span>
        ) : (
          <span>Tap a mood to continue</span>
        )}
      </div>
    </div>
  );
};

export default MoodPicker;
