import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Breadcrumbs from "@/components/molecules/Breadcrumbs";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import FileExplorer from "@/components/organisms/FileExplorer";

const AccessiblePage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      // Dispatch a custom event for FileExplorer to handle the upload
      if (typeof window !== 'undefined' && window.CustomEvent) {
        const event = new window.CustomEvent('file-upload', { 
          detail: { files: Array.from(e.target.files), path: '' } 
        });
        document.dispatchEvent(event);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-surface-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <ApperIcon name="Star" size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Accessible Files</h1>
              <p className="text-gray-500">Frequently accessed and important files</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-1 bg-surface-100 rounded-lg p-1">
              <Button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm text-primary' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                whileHover={false}
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
                whileHover={false}
                whileTap={false}
              >
                <ApperIcon name="List" size={16} />
              </Button>
            </div>
            
            <Button
              onClick={handleUploadClick}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ApperIcon name="Plus" size={16} />
              <span className="hidden sm:block">Upload</span>
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-md">
          <div className="relative">
            <ApperIcon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search accessible files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2"
            />
          </div>
        </div>
      </div>

      {/* File Browser */}
      <div className="flex-1 overflow-hidden">
        <FileExplorer 
          currentPath=""
          viewMode={viewMode}
          searchQuery={searchQuery}
          filterType="accessible"
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

export default AccessiblePage;