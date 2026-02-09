import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Component-level Error Boundary
 * Use this for smaller components that might fail
 */
export default class ComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ComponentErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              {this.props.message || 'Failed to load component'}
            </span>
          </div>
          {this.props.showRetry && (
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Try again
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
