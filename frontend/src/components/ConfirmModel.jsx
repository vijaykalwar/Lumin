import React from 'react';
import { X, AlertTriangle, Trash2, CheckCircle } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger', 'warning', 'success'
  loading = false
}) {
  if (!isOpen) return null;

  const icons = {
    danger: <Trash2 className="w-12 h-12 text-red-500" />,
    arning: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
success: <CheckCircle className="w-12 h-12 text-green-500" />
};
const buttonColors = {
danger: 'bg-red-600 hover:bg-red-700',
warning: 'bg-yellow-600 hover:bg-yellow-700',
success: 'bg-green-600 hover:bg-green-700'
};
return (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
{/* Backdrop */}
<div
     className="absolute inset-0 bg-black/50 backdrop-blur-sm"
     onClick={onClose}
   />
  {/* Modal */}
  <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
    
    {/* Close Button */}
    <button
      onClick={onClose}
      className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <X className="w-5 h-5 text-gray-500" />
    </button>

    {/* Icon */}
    <div className="flex justify-center mb-4">
      {icons[type]}
    </div>

    {/* Title */}
    <h3 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-2">
      {title}
    </h3>

    {/* Message */}
    <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
      {message}
    </p>

    {/* Buttons */}
    <div className="flex gap-3">
      <button
        onClick={onClose}
        disabled={loading}
        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        className={`flex-1 px-4 py-3 text-white rounded-xl font-medium transition-colors disabled:opacity-50 ${buttonColors[type]}`}
      >
        {loading ? 'Processing...' : confirmText}
      </button>
    </div>

  </div>

  <style jsx>{`
    @keyframes scale-in {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    .animate-scale-in {
      animation: scale-in 0.2s ease-out;
    }
  `}</style>
</div>
);
}