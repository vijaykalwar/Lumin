import React from 'react';

// ════════════════════════════════════════════════════════════
// EMPTY STATE COMPONENT
// ════════════════════════════════════════════════════════════

/**  * Reusable Empty State Component
 * @param {React.Component} icon - Lucide icon component
 * @param {string} title - Main heading
 * @param {string} description - Subtext
 * @param {object} action - Optional { label, onClick } for CTA button
 */
function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card text-center py-12">
      {/* Icon */}
      {Icon && (
        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 rounded-full mb-4">
          <Icon size={40} className="text-gray-600" />
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>

      {/* Description */}
      <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>

      {/* Action Button */}
      {action && (
        <button onClick={action.onClick} className="btn-primary">
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
