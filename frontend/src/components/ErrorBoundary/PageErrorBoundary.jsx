import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import { AlertTriangle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Page-level Error Boundary
 * Use this to wrap individual pages/components
 */
export default function PageErrorBoundary({ children, fallback, pageName = 'page' }) {
  const navigate = useNavigate();

  const CustomFallback = ({ error, resetError }) => (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="card">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
            <AlertTriangle size={32} className="text-red-400" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Error loading {pageName}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Something went wrong while loading this {pageName}. Please try again.
          </p>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={resetError}
              className="btn-primary"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback || CustomFallback}>
      {children}
    </ErrorBoundary>
  );
}
