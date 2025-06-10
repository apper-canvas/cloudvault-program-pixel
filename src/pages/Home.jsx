import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '../components/ApperIcon';
import MainFeature from '../components/MainFeature';

const Home = () => {
  const [currentPath, setCurrentPath] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef();

  const breadcrumbs = currentPath ? currentPath.split('/').filter(Boolean) : [];

  const handleNavigate = (path) => {
    setCurrentPath(path);
  };

  const handleBreadcrumbClick = (index) => {
    const newPath = breadcrumbs.slice(0, index + 1).join('/');
    setCurrentPath(newPath);
  };

  const navigateUp = () => {
    const parentPath = breadcrumbs.slice(0, -1).join('/');
    setCurrentPath(parentPath);
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      // MainFeature will handle the upload
      const event = new CustomEvent('file-upload', { 
        detail: { files: Array.from(e.target.files), path: currentPath } 
      });
      document.dispatchEvent(event);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex-shrink-0 bg-white border-b border-surface-200 p-4">
        <div className="flex items-center justify-between mb-4">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <button
              onClick={() => setCurrentPath('')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-surface-100 transition-colors"
            >
              <ApperIcon name="Home" size={16} />
              <span className="text-sm font-medium">My Files</span>
            </button>
            
            {breadcrumbs.map((segment, index) => (
              <div key={index} className="flex items-center space-x-2">
                <ApperIcon name="ChevronRight" size={14} className="text-gray-400" />
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className="text-sm text-gray-600 hover:text-gray-900 hover:bg-surface-100 px-2 py-1 rounded transition-colors"
                >
                  {segment}
                </button>
              </div>
            ))}
            
            {breadcrumbs.length > 0 && (
              <button
                onClick={navigateUp}
                className="ml-4 p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
                title="Go up one level"
              >
                <ApperIcon name="ArrowUp" size={16} className="text-gray-500" />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-1 bg-surface-100 rounded-lg p-1">
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
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpload}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ApperIcon name="Plus" size={16} />
              <span className="hidden sm:block">Upload</span>
            </motion.button>
          </div>
        </div>

        {/* Search Bar (Mobile) */}
        <div className="md:hidden">
          <div className="relative">
            <ApperIcon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* File Browser */}
      <div className="flex-1 overflow-hidden">
        <MainFeature 
          currentPath={currentPath}
          viewMode={viewMode}
          onNavigate={handleNavigate}
          searchQuery={searchQuery}
        />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default Home;