import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

/**
 * AI Coach Card Component
 * Entire card is clickable and navigates to /ai-chat
 */
const AICoachCard = ({ streak = 0 }) => {
  const navigate = useNavigate();

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
    <div
      onClick={() => navigate('/ai-chat')}
      className="card-glass animated-border p-6 space-y-4 animate-fadeIn relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-200 group"
    >
      {/* Glowing Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-cyan-500/5 -z-10 group-hover:from-purple-500/10 group-hover:via-pink-500/10 group-hover:to-cyan-500/10 transition-all duration-200" />

      {/* Header */}
      <div className="flex items-center justify-between">
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
        <ArrowRight className="w-5 h-5 text-purple-500 group-hover:translate-x-1 transition-transform duration-200" />
      </div>

      {/* Quote Box */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
          "{message}"
        </p>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl text-center shadow-lg group-hover:opacity-90 transition-opacity">
        <span className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          Chat with AI Coach
        </span>
      </div>

      <div className="text-xs text-center text-gray-500 dark:text-gray-400">
        Get mood analysis, goal planning &amp; motivation
      </div>
    </div>
  );
};

export default AICoachCard;
