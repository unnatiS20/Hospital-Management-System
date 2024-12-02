import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Data</h3>
        <p className="mt-1 text-sm text-gray-500">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
} 