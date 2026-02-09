import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Reusable Input Component
 * @param {string} label - Input label
 * @param {string} type - Input type (text, email, password, etc.)
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} error - Error message to display
 * @param {boolean} required - Is field required
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Is input disabled
 * @param {object} rest - Other input props
 */
export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  disabled = false,
  className = '',
  ...rest
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`
          w-full px-4 py-3 rounded-xl
          bg-gray-50 dark:bg-gray-700
          border-2 transition-all
          ${error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
          }
          focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...rest}
      />
      {error && (
        <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
