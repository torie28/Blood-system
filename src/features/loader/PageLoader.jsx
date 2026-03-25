import React from 'react';
import SkeletonLoader from './Loader.jsx';

const PageLoader = ({
  variant = 'dashboard-stats',
  message = 'Loading...',
  fullScreen = false,
  overlay = false
}) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-white'
    : overlay
      ? 'absolute inset-0 z-40 flex items-center justify-center bg-white bg-opacity-90'
      : 'w-full h-full flex items-center justify-center min-h-[200px]';

  const getLoaderVariant = () => {
    switch (variant) {
      case 'auth':
        return (
          <div className="w-full max-w-md space-y-4">
            <div className="text-center mb-8">
              <SkeletonLoader variant="avatar" className="mx-auto mb-4" />
              <SkeletonLoader variant="text" lines={2} className="mx-auto" />
            </div>
            <SkeletonLoader variant="form-input" lines={3} />
            <SkeletonLoader variant="button" lines={2} className="mt-6" />
          </div>
        );

      case 'dashboard':
        return (
          <div className="w-full max-w-7xl mx-auto space-y-6">
            <SkeletonLoader variant="dashboard-header" />
            <SkeletonLoader variant="dashboard-stats" lines={4} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <SkeletonLoader variant="text" lines={1} height="h-6" className="mb-4" />
                <SkeletonLoader variant="table-row" lines={5} />
              </div>
              <div>
                <SkeletonLoader variant="text" lines={1} height="h-6" className="mb-4" />
                <SkeletonLoader variant="card" lines={3} />
              </div>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="w-full space-y-4">
            <SkeletonLoader variant="text" lines={1} height="h-6" />
            <SkeletonLoader variant="table" lines={5} />
          </div>
        );

      case 'form':
        return (
          <div className="w-full max-w-2xl mx-auto space-y-6">
            <SkeletonLoader variant="text" lines={1} height="h-8" className="mb-6" />
            <SkeletonLoader variant="form" />
          </div>
        );

      case 'cards':
        return (
          <div className="w-full max-w-7xl mx-auto">
            <SkeletonLoader variant="text" lines={1} height="h-6" className="mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonLoader key={index} variant="card" />
              ))}
            </div>
          </div>
        );

      case 'sidebar':
        return (
          <div className="flex">
            <SkeletonLoader variant="sidebar" />
            <div className="flex-1 p-6">
              <SkeletonLoader variant="dashboard-stats" lines={2} />
            </div>
          </div>
        );

      case 'simple':
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600">{message}</p>
          </div>
        );

      default:
        return (
          <div className="w-full max-w-4xl mx-auto space-y-6">
            <SkeletonLoader variant="text" lines={3} />
            <SkeletonLoader variant="card" lines={2} />
          </div>
        );
    }
  };

  return (
    <div className={containerClasses}>
      <div className="w-full p-6">
        {getLoaderVariant()}
        {message && variant === 'simple' && (
          <p className="text-center text-gray-600 mt-4">{message}</p>
        )}
      </div>
    </div>
  );
};

export default PageLoader;
