import React from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

/**
 * Reusable Select Component
 * @param {string} label - Select label
 * @param {string} value - Selected value
 * @param {function} onChange - Change handler
 * @param {array} options - Array of options [{value, label}]
 * @param {string} error - Error message to display
 * @param {boolean} required - Is field required
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Is select disabled
 * @param {object} rest - Other select props
 */
export default function Select({
  label,
  value,
  onChange,
  options = [],
  error,
  required = false,
  placeholder = 'Select an option',
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
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3 rounded-xl appearance-none
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
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
