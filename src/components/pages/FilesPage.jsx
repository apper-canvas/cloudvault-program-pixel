import { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';
import FileExplorer from '@/components/organisms/FileExplorer';
import Breadcrumbs from '@/components/molecules/Breadcrumbs';
import Button from '@/components/atoms/Button';

const FilesPage = () => {
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
              <Button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm text-primary' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                whileHover={false} // Disable motion for these toggle buttons
                whileTap={false}
              >
                <ApperIcon name="Grid3X3" size={16} />
              </Button>
              <Button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white shadow-sm text-primary' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                whileHover={false} // Disable motion for these toggle buttons
                whileTap={false}
              >
                <ApperIcon name="List" size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <Breadcrumbs 
            pathSegments={breadcrumbs}
            onNavigateToRoot={() => setCurrentPath('')}
            onNavigateToSegment={handleBreadcrumbClick}
          />
        )}
      </div>

      {/* File Browser */}
      <div className="flex-1 overflow-hidden">
        <FileExplorer 
          currentPath={currentPath}
          viewMode={viewMode}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  );
};

export default FilesPage;