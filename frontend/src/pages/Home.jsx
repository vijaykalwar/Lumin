import { Link } from 'react-router-dom';
import { BookOpen, Flame, Bot, TrendingUp, Trophy, Timer, Users, Target, ArrowRight, CheckCircle, Lock, Smartphone, Zap, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../utils/toast';
function Home() {
  const { isAuthenticated } = useAuth();

  // If logged in, redirect to dashboard
  if (isAuthenticated) {
    window.location.href = '/dashboard';
    return null;
  }

  const features = [
    {
      icon: BookOpen,
      title: "Mood Journaling",
      description: "Track emotions with daily reflections. AI analyzes patterns in your journey.",
      color: "from-blue-500 to-cyan-500",
      badge: "Core"
    },
    {
      icon: Flame,
      title: "Streak System",
      description: "Build momentum with visual calendars. Freeze feature protects your progress.",
      color: "from-orange-500 to-red-500",
      badge: "Popular"
    },
    {
      icon: Bot,
      title: "AI Companion",
      description: "Personal coach that learns from your entries. Get plans, motivation, insights.",
      color: "from-purple-500 to-pink-500",
      badge: "AI-Powered"
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description: "Beautiful charts show mood trends, productivity patterns, and growth metrics.",
      color: "from-green-500 to-emerald-500",
      badge: "Insights"
    },
    {
      icon: Trophy,
      title: "Gamification",
      description: "Earn XP, unlock badges, level up. Make growth addictive and fun.",
      color: "from-yellow-500 to-orange-500",
      badge: "Fun"
    },
    {
      icon: Timer,
      title: "Focus Timer",
      description: "Pomodoro technique integrated with journaling. Track deep work sessions.",
      color: "from-indigo-500 to-purple-500",
      badge: "Productivity"
    },
    {
      icon: Users,
      title: "Team Goals",
      description: "Share progress with friends. Compete in challenges, celebrate together.",
      color: "from-pink-500 to-rose-500",
      badge: "Social"
    },
    {
      icon: Target,
      title: "Vision Board",
      description: "Upload dream images. AI suggests action steps. Track goal achievement.",
      color: "from-teal-500 to-cyan-500",
      badge: "Goals"
    }
  ];

  const benefits = [
    { icon: CheckCircle, text: "100% Free Forever", color: "text-green-400" },
    { icon: Lock, text: "End-to-End Encrypted", color: "text-blue-400" },
    { icon: Smartphone, text: "Works Offline (PWA)", color: "text-purple-400" },
    { icon: Zap, text: "Instant Sync", color: "text-yellow-400" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* Hero Section */}
      <div className="page-container py-20 md:py-28">
        <div className="text-center max-w-5xl mx-auto">
          
          {/* Floating badge */}
          <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/30 rounded-full px-4 py-2 mb-8 animate-fadeIn">
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-primary-300 font-medium">Trusted by self-improvement enthusiasts</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fadeIn">
            Build Better Habits.{' '}
            <span className="block mt-2 bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent">
              One Day at a Time.
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            Your gamified growth companion with AI coaching. 
            Track progress, stay consistent, level up your life.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              to="/getting-started" 
              className="btn-primary text-lg px-10 py-5 flex items-center justify-center space-x-3 group shadow-glow"
            >
              <span>See How It Works</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/register" 
              className="btn-outline text-lg px-10 py-5 flex items-center justify-center space-x-2"
            >
              <Target size={20} />
              <span>Start Free</span>
            </Link>
          </div>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center space-x-2 text-gray-400">
                <benefit.icon size={20} className={benefit.color} />
                <span className="text-sm md:text-base">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="page-container py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to Grow
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Powerful features designed for sustainable personal development
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group card hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              {/* Gradient glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              
              {/* Badge */}
              <div className="absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-full bg-slate-700/50 text-gray-400">
                {feature.badge}
              </div>
              
              <div className="relative">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon size={28} className="text-white" strokeWidth={2} />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works (3 Steps) */}
      <div className="bg-slate-800/30 py-20">
        <div className="page-container">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Start Growing in 3 Steps
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { num: "1", title: "Create Account", desc: "Sign up in 30 seconds. No credit card required." },
              { num: "2", title: "Set Your Goals", desc: "Tell us what you want to achieve. AI creates your plan." },
              { num: "3", title: "Track Daily", desc: "Journal, earn XP, build streaks. Watch progress unfold." }
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full text-2xl font-bold text-white mb-4 shadow-xl">
                  {step.num}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="page-container py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="card bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20 p-12 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }}></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Level Up Your Life?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join the gamified growth movement. Build habits that stick, 
                track progress that matters, celebrate wins that count.
              </p>
              <Link 
                to="/register" 
                className="btn-primary text-lg px-12 py-5 inline-flex items-center space-x-3 shadow-glow-pink"
              >
                <span>Start Your Journey Free</span>
                <Zap size={24} />
              </Link>
              <p className="text-sm text-gray-500 mt-6">
                No credit card • 2-minute setup • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

/* ════════════════════════════════════════════════════════════
   ✨ IMPROVEMENTS MADE:
   ════════════════════════════════════════════════════════════
   
   1. REMOVED FAKE STATS:
      ✅ No more "10K users" that don't exist
      ✅ Focus on features and benefits instead
   
   2. CONDITIONAL REDIRECT:
      ✅ If user logged in → Auto-redirect to dashboard
      ✅ Home page only for non-logged users
   
   3. REAL TRUST SIGNALS:
      ✅ "Free Forever" - Factual
      ✅ "Encrypted" - Technical feature
      ✅ "Works Offline" - PWA capability
      ✅ "Instant Sync" - Real functionality
   
   4. GAMIFICATION HINTS:
      ✅ "Level up your life" language
      ✅ XP/badges mentioned
      ✅ Feature badges (Core, Popular, AI-Powered)
   
   5. CLEARER VALUE PROP:
      ✅ "Gamified growth companion"
      ✅ "AI coaching"
      ✅ "One day at a time" (consistency focus)
   
   ════════════════════════════════════════════════════════════ */