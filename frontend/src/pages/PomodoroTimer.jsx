import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { pomodoroAPI } from '../utils/api';
import { Play, Pause, RotateCcw, Coffee, Brain, Clock, TrendingUp } from 'lucide-react';
import { showToast } from '../utils/toast';
function PomodoroTimer() {
  // Timer state
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState('focus'); // 'focus', 'short-break', 'long-break'
  const [sessionCount, setSessionCount] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Form state
  const [task, setTask] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [notes, setNotes] = useState('');

  // Stats state
  const [todayStats, setTodayStats] = useState(null);
  const [sessions, setSessions] = useState([]);

  const intervalRef = useRef(null);
  const navigate = useNavigate();

  // Session durations (in seconds)
  const durations = {
    focus: 25 * 60,
    'short-break': 5 * 60,
    'long-break': 15 * 60
  };

  // Fetch today's sessions on mount
  useEffect(() => {
    fetchTodayStats();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  // Fetch today's stats
  const fetchTodayStats = async () => {
    const result = await pomodoroAPI.getToday();
    if (result.success) {
      setTodayStats(result.data.stats);
      setSessions(result.data.sessions);
      setSessionCount(result.data.stats.focusSessions || 0);
    }
  };

  // Start session
  const handleStart = async () => {
    if (!isRunning) {
      // Start new session in backend
      const result = await pomodoroAPI.start({
        type: sessionType,
        duration: Math.floor(timeLeft / 60),
        task: task || 'Untitled session'
      });

      if (result.success) {
        setCurrentSessionId(result.data._id);
        setIsRunning(true);
      }
    } else {
      setIsRunning(false);
    }
  };

  // Reset timer
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(durations[sessionType]);
    setCurrentSessionId(null);
  };

  // Timer complete
  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Play notification sound (optional)
    playNotificationSound();
    
    // Show completion modal
    setShowCompleteModal(true);
  };

  // Complete session
  const handleCompleteSession = async () => {
    if (currentSessionId) {
      const result = await pomodoroAPI.complete(currentSessionId, notes);
      
      if (result.success) {
        alert(`${result.message}\nNew XP: ${result.data.totalXP}`);
        
        // Update session count
        if (sessionType === 'focus') {
          setSessionCount(prev => prev + 1);
        }
        
        // Auto-switch to break
        autoSwitchSession();
        
        // Refresh stats
        fetchTodayStats();
        
        // Close modal
        setShowCompleteModal(false);
        setNotes('');
      }
    }
  };

  // Auto-switch to appropriate break
  const autoSwitchSession = () => {
    if (sessionType === 'focus') {
      // After 4 focus sessions, take long break
      if (sessionCount > 0 && (sessionCount + 1) % 4 === 0) {
        switchSession('long-break');
      } else {
        switchSession('short-break');
      }
    } else {
      switchSession('focus');
    }
  };

  // Switch session type
  const switchSession = (type) => {
    setSessionType(type);
    setTimeLeft(durations[type]);
    setIsRunning(false);
    setCurrentSessionId(null);
  };

  // Play notification sound
  const playNotificationSound = () => {
    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get session color
  const getSessionColor = () => {
    if (sessionType === 'focus') return 'from-blue-500 to-cyan-500';
    if (sessionType === 'short-break') return 'from-green-500 to-emerald-500';
    return 'from-purple-500 to-pink-500';
  };

  // Progress percentage
  const progress = ((durations[sessionType] - timeLeft) / durations[sessionType]) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Pomodoro Timer</h1>
          <p className="text-gray-400">Focus in 25-minute intervals</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Timer Section */}
          <div className="lg:col-span-2">
            <div className="card">
              
              {/* Session Type Selector */}
              <div className="flex space-x-2 mb-6">
                <button
                  onClick={() => switchSession('focus')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    sessionType === 'focus'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  <Brain size={20} className="inline mr-2" />
                  Focus
                </button>
                <button
                  onClick={() => switchSession('short-break')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    sessionType === 'short-break'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  <Coffee size={20} className="inline mr-2" />
                  Short Break
                </button>
                <button
                  onClick={() => switchSession('long-break')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    sessionType === 'long-break'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  <Coffee size={20} className="inline mr-2" />
                  Long Break
                </button>
              </div>

              {/* Timer Display */}
              <div className="relative">
                {/* Circular Progress */}
                <div className="flex items-center justify-center mb-8">
                  <div className="relative w-80 h-80">
                    {/* Background circle */}
                    <svg className="transform -rotate-90 w-80 h-80">
                      <circle
                        cx="160"
                        cy="160"
                        r="140"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-slate-700"
                      />
                      <circle
                        cx="160"
                        cy="160"
                        r="140"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 140}`}
                        strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
                        className="transition-all duration-1000"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" className={`text-blue-500`} stopColor="currentColor" />
                          <stop offset="100%" className={`text-cyan-500`} stopColor="currentColor" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Time Display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-7xl font-bold text-white mb-2">
                        {formatTime(timeLeft)}
                      </div>
                      <div className="text-gray-400 text-lg capitalize">
                        {sessionType.replace('-', ' ')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task Input */}
                {sessionType === 'focus' && !isRunning && (
                  <div className="mb-6">
                    <input
                      type="text"
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      placeholder="What are you working on?"
                      className="input-field"
                    />
                  </div>
                )}

                {/* Controls */}
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={handleStart}
                    className={`btn-primary px-12 py-4 text-lg ${
                      isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : ''
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Pause size={24} className="inline mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play size={24} className="inline mr-2" />
                        Start
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="btn-secondary px-6 py-4"
                  >
                    <RotateCcw size={24} />
                  </button>
                </div>
              </div>
            </div>

            {/* Today's Sessions */}
            <div className="card mt-6">
              <h2 className="text-xl font-bold text-white mb-4">Today's Sessions</h2>
              {sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.slice(0, 5).map((session) => (
                    <div
                      key={session._id}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {session.type === 'focus' ? (
                          <Brain className="text-blue-400" size={20} />
                        ) : (
                          <Coffee className="text-green-400" size={20} />
                        )}
                        <div>
                          <div className="text-white font-semibold">{session.task}</div>
                          <div className="text-sm text-gray-400">
                            {session.duration} min • {session.completed ? '✓ Completed' : 'In progress'}
                          </div>
                        </div>
                      </div>
                      {session.completed && (
                        <div className="text-primary-400 font-bold">
                          +{session.xpAwarded} XP
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Clock size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No sessions yet today</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            
            {/* Today's Stats */}
            {todayStats && (
              <div className="card">
                <h2 className="text-xl font-bold text-white mb-4">Today's Progress</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Focus Sessions</span>
                    <span className="text-2xl font-bold text-white">
                      {todayStats.focusSessions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Completed</span>
                    <span className="text-2xl font-bold text-green-400">
                      {todayStats.completedSessions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Focus Time</span>
                    <span className="text-2xl font-bold text-blue-400">
                      {todayStats.totalFocusTime} min
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">XP Earned</span>
                    <span className="text-2xl font-bold text-yellow-400">
                      {todayStats.totalXP}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="card bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <h3 className="text-lg font-bold text-white mb-3">🎯 Pomodoro Tips</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Work for 25 minutes without distractions</li>
                <li>• Take a 5-minute break after each session</li>
                <li>• After 4 sessions, take a 15-minute break</li>
                <li>• Turn off notifications during focus time</li>
                <li>• Use breaks to stretch and hydrate</li>
              </ul>
            </div>

            {/* Quick Stats */}
            <button
              onClick={() => navigate('/analytics')}
              className="card hover:scale-105 transition cursor-pointer"
            >
              <TrendingUp className="text-primary-400 mb-2" size={32} />
              <h3 className="text-lg font-bold text-white mb-1">View Analytics</h3>
              <p className="text-sm text-gray-400">
                See your productivity trends
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full animate-scaleIn">
            <h2 className="text-2xl font-bold text-white mb-4">
              🎉 Session Complete!
            </h2>
            <p className="text-gray-300 mb-4">
              Great work! How did it go?
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional: Add notes about this session..."
              className="input-field min-h-[100px] mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={handleCompleteSession}
                className="btn-primary flex-1"
              >
                Complete & Get XP
              </button>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="btn-secondary"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PomodoroTimer;