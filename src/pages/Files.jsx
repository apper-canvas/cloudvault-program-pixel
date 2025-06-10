import { useState } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '../components/ApperIcon';
import MainFeature from '../components/MainFeature';

const Files = () => {
  const [currentPath, setCurrentPath] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const breadcrumbs = currentPath ? currentPath.split('/').filter(Boolean) : [];

  const handleNavigate = (path) => {
    setCurrentPath(path);
  };

  const handleBreadcrumbClick = (index) => {
    const newPath = breadcrumbs.slice(0, index + 1).join('/');
    setCurrentPath(newPath);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-surface-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-semibold text-gray-900">All Files</h1>
            <p className="text-gray-500 mt-1">Browse and manage your files</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className="flex items-center space-x-1 bg-surface-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm text-primary' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ApperIcon name="Grid3X3" size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white shadow-sm text-primary' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ApperIcon name="List" size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 mt-4 text-sm"
          >
            <button
              onClick={() => setCurrentPath('')}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              All Files
            </button>
            {breadcrumbs.map((segment, index) => (
              <div key={index} className="flex items-center space-x-2">
                <ApperIcon name="ChevronRight" size={14} className="text-gray-400" />
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`transition-colors ${
                    index === breadcrumbs.length - 1 
                      ? 'text-gray-900 font-medium' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {segment}
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* File Browser */}
      <div className="flex-1 overflow-hidden">
        <MainFeature 
          currentPath={currentPath}
          viewMode={viewMode}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  );
};

export default Files;