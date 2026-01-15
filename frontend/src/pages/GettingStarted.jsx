import { Link } from 'react-router-dom';
import { Target, TrendingUp, Brain, Users, Trophy, Zap } from 'lucide-react';

function GettingStarted() {
  const steps = [
    {
      icon: Target,
      title: "Set Your Goals",
      description: "Define what you want to achieve and break it into milestones"
    },
    {
      icon: TrendingUp,
      title: "Track Progress Daily",
      description: "Journal your mood, reflect on experiences, build streaks"
    },
    {
      icon: Brain,
      title: "Get AI Guidance",
      description: "Receive personalized motivation and actionable advice"
    },
    {
      icon: Trophy,
      title: "Earn Rewards",
      description: "Unlock badges, level up, and celebrate consistency"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* Hero Section */}
      <div className="page-container py-20">
        <div className="text-center max-w-4xl mx-auto animate-fadeIn">
          
          {/* Animated Icon */}
          <div className="inline-block mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-primary-500 to-accent-500 rounded-full p-8 shadow-2xl">
                <Target size={64} className="text-white" strokeWidth={2} />
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Your Journey to{' '}
            <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Consistent Growth
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
            LUMIN helps you build habits, track progress, and stay motivated. 
            Join thousands who've transformed their lives through daily consistency.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2">
              <span>Start Your Journey</span>
              <Zap size={20} />
            </Link>
            <Link to="/login" className="btn-outline text-lg px-8 py-4">
              I Already Have an Account
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="page-container py-16">
        <h2 className="text-4xl font-bold text-center text-white mb-4">
          How LUMIN Works
        </h2>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Four simple steps to transform your daily routine into a powerful growth system
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="card text-center hover:scale-105 transition-transform">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full mb-4">
                <step.icon size={32} className="text-white" />
              </div>
              <div className="text-2xl font-bold text-primary-400 mb-2">
                Step {index + 1}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-gray-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="card text-center">
            <div className="text-4xl font-bold text-primary-400 mb-2">10,000+</div>
            <div className="text-gray-400">Active Users</div>
          </div>
          <div className="card text-center">
            <div className="text-4xl font-bold text-accent-400 mb-2">85%</div>
            <div className="text-gray-400">Consistency Rate</div>
          </div>
          <div className="card text-center">
            <div className="text-4xl font-bold text-primary-400 mb-2">500K+</div>
            <div className="text-gray-400">Entries Logged</div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-slate-800/50 py-16">
        <div className="page-container">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah K.",
                role: "Software Engineer",
                text: "LUMIN helped me build a consistent journaling habit. The AI motivation is spot-on!"
              },
              {
                name: "Mike R.",
                role: "Student",
                text: "The streak system keeps me accountable. I've never been this consistent before."
              },
              {
                name: "Lisa M.",
                role: "Entrepreneur",
                text: "Best productivity app I've used. The Pomodoro timer + journal combo is perfect."
              }
            ].map((testimonial, i) => (
              <div key={i} className="card">
                <div className="flex items-center space-x-2 mb-4">
                  {[1,2,3,4,5].map(star => (
                    <Trophy key={star} size={16} className="text-accent-400 fill-accent-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="page-container py-16 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to Start Growing?
        </h2>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Join LUMIN today and build the consistent habits that will transform your life.
        </p>
        <Link 
          to="/register" 
          className="btn-primary text-lg px-12 py-5 inline-flex items-center space-x-3 text-xl"
        >
          <span>Create Free Account</span>
          <Target size={24} />
        </Link>
        <p className="text-sm text-gray-500 mt-6">
          No credit card required • Free forever • Cancel anytime
        </p>
      </div>
    </div>
  );
}

export default GettingStarted;