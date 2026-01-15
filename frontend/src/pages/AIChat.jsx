import React, { useState, useEffect, useRef } from 'react';
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
  MessageCircle 
} from 'lucide-react';

export default function AIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load prompts
  useEffect(() => {
    loadPrompts();
    
    // Welcome message
    setMessages([{
      role: 'assistant',
      content: `Hey ${user?.name || 'there'}! 👋 I'm LUMIN AI, your personal growth companion. I can help you with mood analysis, goal planning, habit suggestions, and motivation. What would you like to explore today?`,
      timestamp: new Date()
    }]);
  }, [user]);

  const loadPrompts = async () => {
    const result = await aiAPI.getPrompts();
    if (result.success) {
      setPrompts(result.data);
    }
  };

  // Send message
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

    try {
      const result = await aiAPI.chat({
        message: messageText,
        conversationHistory: messages
      });

      if (result.success) {
        const aiMessage = {
          role: 'assistant',
          content: result.data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: '❌ Oops! I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Handle prompt click
  const handlePromptClick = async (prompt) => {
    handleSend(prompt.prompt);
  };

  // Quick actions
  const quickActions = [
    {
      icon: Heart,
      label: 'Analyze Mood',
      action: async () => {
        setLoading(true);
        const result = await aiAPI.analyzeMood();
        setLoading(false);
        
        if (result.success) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: result.data.analysis,
            timestamp: new Date()
          }]);
        }
      }
    },
    {
      icon: Target,
      label: 'Plan Goal',
      action: () => handleSend('Help me plan a new goal')
    },
    {
      icon: TrendingUp,
      label: 'Get Motivated',
      action: async () => {
        setLoading(true);
        const result = await aiAPI.getMotivation({ situation: 'general' });
        setLoading(false);
        
        if (result.success) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: result.data.motivation,
            timestamp: new Date()
          }]);
        }
      }
    },
    {
      icon: Lightbulb,
      label: 'Suggest Habits',
      action: async () => {
        setLoading(true);
        const result = await aiAPI.suggestHabits();
        setLoading(false);
        
        if (result.success) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: result.data.suggestions,
            timestamp: new Date()
          }]);
        }
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                LUMIN AI Assistant
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your personal growth companion powered by Gemini AI
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && (
         // Quick Actions - Mobile grid
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
  {quickActions.map((action, index) => (
    <button
      key={index}
      className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md"
    >
      <action.icon className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" />
      <p className="text-xs sm:text-sm font-medium">{action.label}</p>
    </button>
  ))}
</div>
        )}

        {/* Chat Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                        LUMIN AI
                      </span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                  <p className={`text-xs mt-2 ${
                    msg.role === 'user' ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
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
                placeholder="Ask me anything about your goals, mood, or habits..."
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Suggested Prompts (show when no conversation) */}
        {messages.length <= 1 && prompts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Try asking about:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handlePromptClick(prompt)}
                  disabled={loading}
                  className="text-left p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 disabled:opacity-50"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{prompt.title.split(' ')[0]}</span>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                        {prompt.title.substring(2)}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {prompt.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}