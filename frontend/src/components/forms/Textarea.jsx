import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Reusable Textarea Component
 * @param {string} label - Textarea label
 * @param {string} value - Textarea value
 * @param {function} onChange - Change handler
 * @param {string} error - Error message to display
 * @param {boolean} required - Is field required
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Is textarea disabled
 * @param {number} rows - Number of rows
 * @param {number} maxLength - Maximum character length
 * @param {object} rest - Other textarea props
 */
export default function Textarea({
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  disabled = false,
  rows = 4,
  maxLength,
  className = '',
  showCharCount = false,
  ...rest
}) {
  const charCount = value?.length || 0;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        className={`
          w-full px-4 py-3 rounded-xl resize-none
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
      <div className="flex items-center justify-between mt-1">
        {error && (
          <div className="flex items-center gap-1 text-sm text-red-500">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        {showCharCount && maxLength && (
          <span className={`text-xs ml-auto ${charCount > maxLength * 0.9 ? 'text-orange-500' : 'text-gray-500'}`}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
