import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { aiAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Brain, 
  Target, 
  TrendingUp, 
  Heart,
  Lightbulb,
  MessageCircle,
  Bot
} from 'lucide-react';

// ✨ Typing Indicator Component
const TypingIndicator = () => (
  <div className="flex items-center gap-2 p-4">
    <div className="flex gap-1">
      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
    </div>
    <span className="text-sm text-gray-500">LUMIN AI is typing...</span>
  </div>
);

export default function AIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    loadPrompts();
    setMessages([{
      role: 'assistant',
      content: `Hey ${user?.name || 'there'}! 👋 I'm LUMIN AI, your personal growth companion. I can help you with mood analysis, goal planning, habit suggestions, and motivation. What would you like to explore today?`,
      timestamp: new Date()
    }]);
  }, [user]);

  const loadPrompts = async () => {
    try {
      const result = await aiAPI.getPrompts();
      if (result?.success && result.data != null) {
        setPrompts(Array.isArray(result.data) ? result.data : (result.data.prompts || []));
      }
    } catch (_) {
      setPrompts([]);
    }
  };

  const handleSend = async (messageText = input) => {
    if (!messageText.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    let result = null;
    try {
      result = await aiAPI.chat({
        message: messageText,
        conversationHistory: messages
      });

      if (result?.success && result?.data?.response) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.data.response,
          timestamp: new Date()
        }]);
      } else {
        const errMsg = result?.message || 'Failed to process your message. Please try again.';
        const errorContent = errMsg.includes('leaked')
          ? '⚠️ API configuration issue. Please try again later.'
          : `❌ ${errMsg}`;
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: errorContent,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      const errMsg = result?.message || error?.message || '';
      let errorContent = '❌ Something went wrong. Please try again.';
      if (errMsg.includes('timeout') || errMsg.includes('Timeout')) {
        errorContent = '❌ Request took too long. Please try again.';
      } else if (errMsg.includes('fetch') || errMsg.includes('network') || error?.name === 'TypeError') {
        errorContent = '❌ Network error. Check your connection and try again.';
      } else if (errMsg) {
        errorContent = `❌ ${errMsg}`;
      }
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorContent,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: Heart,
      label: 'Analyze Mood',
      gradient: 'from-red-500 to-pink-500',
      action: async () => {
        setLoading(true);
        try {
          const result = await aiAPI.analyzeMood();
          const content = result?.success && result?.data?.analysis
            ? result.data.analysis
            : (result?.message || 'Could not analyze mood. Try adding more journal entries first.');
          setMessages(prev => [...prev, { role: 'assistant', content, timestamp: new Date() }]);
        } catch {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '❌ Failed to analyze mood. Please try again.',
            timestamp: new Date()
          }]);
        } finally {
          setLoading(false);
        }
      }
    },
    {
      icon: Target,
      label: 'Plan Goal',
      gradient: 'from-blue-500 to-cyan-500',
      action: () => handleSend('Help me plan a new goal')
    },
    {
      icon: TrendingUp,
      label: 'Get Motivated',
      gradient: 'from-orange-500 to-yellow-500',
      action: async () => {
        setLoading(true);
        try {
          const result = await aiAPI.getMotivation({ situation: 'general' });
          const content = result?.success && result?.data?.motivation
            ? result.data.motivation
            : (result?.message || 'Could not fetch motivation right now.');
          setMessages(prev => [...prev, { role: 'assistant', content, timestamp: new Date() }]);
        } catch {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '❌ Failed to get motivation. Please try again.',
            timestamp: new Date()
          }]);
        } finally {
          setLoading(false);
        }
      }
    },
    {
      icon: Lightbulb,
      label: 'Suggest Habits',
      gradient: 'from-purple-500 to-pink-500',
      action: async () => {
        setLoading(true);
        try {
          const result = await aiAPI.suggestHabits();
          const content = result?.success && result?.data?.suggestions
            ? result.data.suggestions
            : (result?.message || 'Could not suggest habits right now.');
          setMessages(prev => [...prev, { role: 'assistant', content, timestamp: new Date() }]);
        } catch {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '❌ Failed to suggest habits. Please try again.',
            timestamp: new Date()
          }]);
        } finally {
          setLoading(false);
        }
      }
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 safe-bottom">
        
        {/* ✨ Premium Header */}
        <div className="mb-6 text-center animate-fadeIn">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg animate-float">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black gradient-text mb-2">
            LUMIN AI Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Powered by Gemini AI ✨
          </p>
        </div>

        {/* 🎯 Quick Actions - Only show at start */}
        {messages.length <= 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-scaleIn">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                disabled={loading}
                className={`touch-target glass-strong rounded-2xl p-4 hover:scale-105 transition-all active:scale-95 disabled:opacity-50`}
              >
                <div className={`w-12 h-12 mx-auto mb-2 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">{action.label}</p>
              </button>
            ))}
          </div>
        )}

        {/* 💬 Chat Container - Premium Design */}
        <div className="glass-strong rounded-3xl overflow-hidden shadow-2xl min-h-[500px] flex flex-col">
          
          {/* Messages Area */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[60vh]">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* AI Avatar */}
                {msg.role === 'assistant' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-3 flex-shrink-0 shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}

                {/* Message Bubble */}
                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 opacity-75">
                      <Sparkles className="w-3 h-3" />
                      <span className="text-xs font-bold">LUMIN AI</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                    {msg.content}
                  </p>
                  <p className={`text-xs mt-2 opacity-50`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>

                {/* User Avatar */}
                {msg.role === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center ml-3 flex-shrink-0 shadow-lg font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ))}

            {/* ✨ Typing Indicator */}
            {loading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Sticky Bottom */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your growth..."
                disabled={loading}
                className="input-field flex-1 text-sm sm:text-base"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-primary touch-target px-6 disabled:scale-100"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Suggested Prompts */}
        {messages.length <= 1 && prompts.length > 0 && (
          <div className="mt-6 animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Try asking about:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prompts.slice(0, 4).map((p, idx) => (
                <button
                  key={p.id ?? idx}
                  onClick={() => handleSend(p.prompt || p.title || '')}
                  disabled={loading}
                  className="card-hover p-4 text-left"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{typeof p.title === 'string' && p.title.trim() ? p.title.trim().split(/\s/)[0] : '✨'}</span>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                        {typeof p.title === 'string' ? p.title.replace(/^[\s\S]{0,2}/, '').trim() || p.title : (p.description || 'Ask')}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {p.description || ''}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  );
}