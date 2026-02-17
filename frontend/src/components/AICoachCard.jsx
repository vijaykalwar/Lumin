import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

/**
 * AI Coach Card Component
 * Displays AI coach section with glowing animated border
 * Currently disabled with "Coming Soon" label
 * 
 * @param {number} streak - Current user streak for dynamic messaging
 */
const AICoachCard = ({ streak = 0 }) => {
  // Dynamic message based on streak
  const getMessage = () => {
    if (streak > 7) {
      return "You're showing incredible dedication! Your consistency is impressive. Keep up the amazing work!";
    } else if (streak > 0) {
      return `Great start on your ${streak}-day streak! Stay focused and you'll build amazing habits.`;
    } else {
      return "Every achievement begins with a single step. Start your journey today!";
    }
  };

  const message = getMessage();

  return (
    <div className="card-glass animated-border p-6 space-y-4 animate-fadeIn relative overflow-hidden">
      {/* Glowing Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-cyan-500/5 -z-10" />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            AI Coach
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get personalized advice
          </p>
        </div>
      </div>

      {/* Quote Box */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
          "{message}"
        </p>
      </div>

      {/* Action: Open AI Chat */}
      <Link
        to="/ai-chat"
        className="block w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl text-center hover:opacity-90 transition-opacity shadow-lg"
      >
        <span className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          Chat with AI Coach
        </span>
      </Link>

      <div className="text-xs text-center text-gray-500 dark:text-gray-400">
        Get mood analysis, goal planning &amp; motivation
      </div>
    </div>
  );
};

export default AICoachCard;
