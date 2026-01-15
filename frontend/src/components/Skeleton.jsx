import React from 'react';

export const Skeleton = ({ className = '', variant = 'rectangular', ...props }) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4'
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
    <div className="flex items-start gap-4 mb-4">
      <Skeleton variant="circular" className="w-12 h-12" />
      <div className="flex-1">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-20 w-full mb-4" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-6 w-16" />
    </div>
  </div>
);

export const EntrySkeleton = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const StatSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <Skeleton variant="circular" className="w-12 h-12" />
      <Skeleton className="h-8 w-16" />
    </div>
    <Skeleton className="h-6 w-32 mb-2" />
    <Skeleton className="h-4 w-24" />
  </div>
);