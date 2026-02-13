import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { goalsAPI } from '../utils/api';
import { showToast } from '../utils/toast';
import { ArrowLeft, Target, Plus, X } from 'lucide-react';

function CreateGoal() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    metric: 'Progress',
    targetValue: '',
    currentValue: 0,
    unit: 'units',
    category: 'career',
    priority: 'medium',
    targetDate: '',
    tags: ''
  });

  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const categories = [
    { value: 'career', icon: '💼', label: 'Career' },
    { value: 'health', icon: '💪', label: 'Health' },
    { value: 'learning', icon: '📚', label: 'Learning' },
    { value: 'finance', icon: '💰', label: 'Finance' },
    { value: 'relationships', icon: '❤️', label: 'Relationships' },
    { value: 'hobbies', icon: '🎨', label: 'Hobbies' },
    { value: 'other', icon: '🎯', label: 'Other' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: '',
        description: '',
        targetValue: '',
        xpReward: 25
      }
    ]);
  };

  const updateMilestone = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const removeMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.targetValue || !formData.targetDate) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const goalData = {
      ...formData,
      targetValue: parseFloat(formData.targetValue),
      tags: tagsArray,
      milestones: milestones.filter(m => m.title)
    };

    const result = await goalsAPI.create(goalData);

    if (result.success) {
      showToast.success(`Goal created successfully! +${result.data.xpEarned} XP`);
      // Return to home/dashboard after creating a goal
      navigate('/dashboard');
    } else {
      setError(result.message || 'Failed to create goal');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/goals')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-white">Create New Goal</h1>
          <div className="w-20"></div>
        </div>

        <div className="card">
          
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* SMART Goal Template */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-2">🎯 SMART Goal Framework</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li><strong>S</strong>pecific: Clearly define what you want to achieve</li>
                <li><strong>M</strong>easurable: Add numbers to track progress</li>
                <li><strong>A</strong>chievable: Set realistic targets</li>
                <li><strong>R</strong>elevant: Align with your values</li>
                <li><strong>T</strong>ime-bound: Set a deadline</li>
              </ul>
            </div>

            {/* Category Selection */}
            <div>
              <label className="input-label mb-3">Category *</label>
              <div className="grid grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`p-4 rounded-lg border-2 transition ${
                      formData.category === cat.value
                        ? 'border-primary-500 bg-primary-500/20'
                        : 'border-gray-700 hover:border-gray-600 bg-slate-800/50'
                    }`}
                  >
                    <div className="text-3xl mb-1">{cat.icon}</div>
                    <div className="text-xs text-gray-300">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="input-label">Goal Title * (Specific)</label>
              <input
                type="text"
                name="title"
                className="input-field"
                placeholder="e.g., Run a 5K marathon"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength="100"
              />
            </div>

            {/* Description */}
            <div>
              <label className="input-label">Description * (Achievable & Relevant)</label>
              <textarea
                name="description"
                className="input-field min-h-[100px]"
                placeholder="Why is this goal important? How will you achieve it?"
                value={formData.description}
                onChange={handleChange}
                required
                maxLength="500"
              />
            </div>

            {/* Measurable Metrics */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="input-label">Metric Name</label>
                <input
                  type="text"
                  name="metric"
                  className="input-field"
                  placeholder="Distance"
                  value={formData.metric}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="input-label">Target Value * (Measurable)</label>
                <input
                  type="number"
                  name="targetValue"
                  className="input-field"
                  placeholder="5"
                  value={formData.targetValue}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="input-label">Unit</label>
                <input
                  type="text"
                  name="unit"
                  className="input-field"
                  placeholder="kilometers"
                  value={formData.unit}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Priority & Deadline */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Priority</label>
                <select
                  name="priority"
                  className="input-field"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="input-label">Target Date * (Time-bound)</label>
                <input
                  type="date"
                  name="targetDate"
                  className="input-field"
                  value={formData.targetDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Milestones */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="input-label">Milestones (Optional)</label>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="flex items-center space-x-1 text-sm text-primary-400 hover:text-primary-300"
                >
                  <Plus size={16} />
                  <span>Add Milestone</span>
                </button>
              </div>

              {milestones.map((milestone, index) => (
                <div key={index} className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-400">Milestone {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Milestone title"
                      value={milestone.title}
                      onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        className="input-field"
                        placeholder="Target value"
                        value={milestone.targetValue}
                        onChange={(e) => updateMilestone(index, 'targetValue', e.target.value)}
                      />
                      <input
                        type="number"
                        className="input-field"
                        placeholder="XP Reward"
                        value={milestone.xpReward}
                        onChange={(e) => updateMilestone(index, 'xpReward', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div>
              <label className="input-label">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                className="input-field"
                placeholder="fitness, challenge, 2024"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full text-lg"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="spinner"></span>
                  <span>Creating Goal...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Target size={20} />
                  <span>Create Goal (+50 XP)</span>
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateGoal;