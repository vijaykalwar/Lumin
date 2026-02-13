import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Target, Clock, X } from 'lucide-react';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { 
      to: '/add-entry', 
      icon: BookOpen, 
      label: 'Quick Journal', 
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'hover:from-purple-600 hover:to-pink-600' 
    },
    { 
      to: '/create-goal', 
      icon: Target, 
      label: 'New Goal', 
      color: 'from-blue-500 to-cyan-500',
      hoverColor: 'hover:from-blue-600 hover:to-cyan-600' 
    },
    { 
      to: '/pomodoro', 
      icon: Clock, 
      label: 'Start Timer', 
      color: 'from-orange-500 to-red-500',
      hoverColor: 'hover:from-orange-600 hover:to-red-600' 
    }
  ];

  return (
    <div className="fixed bottom-24 right-4 sm:right-8 z-40">
      {/* Speed Dial Menu */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 flex flex-col gap-3 mb-2 animate-fadeIn">
          {actions.map((action, index) => (
            <Link
              key={action.to}
              to={action.to}
              onClick={() => setIsOpen(false)}
              className={`group flex items-center gap-3 bg-gradient-to-r ${action.color} ${action.hoverColor} text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105`}
              style={{ 
                animation: `slideInRight 0.3s ease-out ${index * 0.1}s both` 
              }}
            >
              <action.icon className="w-5 h-5" />
              <span className="font-medium text-sm whitespace-nowrap">{action.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all flex items-center justify-center text-white ${
          !isOpen ? 'fab-pulse' : ''
        }`}
        aria-label="Quick Actions"
      >
        {isOpen ? (
          <X className="w-6 h-6 rotate-90 transition-transform" />
        ) : (
          <Plus className="w-6 h-6 transition-transform" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

// Add animations to global CSS if not already present
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
if (!document.querySelector('style[data-fab-animations]')) {
  style.setAttribute('data-fab-animations', 'true');
  document.head.appendChild(style);
}

export default FloatingActionButton;
