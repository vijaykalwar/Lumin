import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Target, Brain, User } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/entries', icon: BookOpen, label: 'Journal' },
    { to: '/goals', icon: Target, label: 'Goals' },
    { to: '/ai-chat', icon: Brain, label: 'AI' },
    { to: '/profile', icon: User, label: 'Profile' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="show-mobile fixed bottom-0 left-0 right-0 glass-strong border-t border-gray-200 dark:border-gray-700 z-50 safe-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`
                touch-target flex-1 flex flex-col items-center justify-center gap-1
                transition-all duration-300
                ${active 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }
              `}
            >
              <div className={`
                p-2 rounded-xl transition-all
                ${active ? 'bg-purple-100 dark:bg-purple-900/30 scale-110' : ''}
              `}>
                <item.icon 
                  className={`w-6 h-6 ${active ? 'animate-pulse' : ''}`} 
                  strokeWidth={active ? 2.5 : 2}
                />
              </div>
              <span className={`text-xs font-medium ${active ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
