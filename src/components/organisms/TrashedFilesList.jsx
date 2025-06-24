import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import trashedFileService from '@/services/api/trashedFileService';
import Button from '@/components/atoms/Button';
import Checkbox from '@/components/atoms/Checkbox';
import LoadingSkeleton from '@/components/molecules/LoadingSkeleton';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import FileListItem from '@/components/molecules/FileListItem';

const TrashedFilesList = () => {
  const [trashedFiles, setTrashedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    loadTrashedFiles();
  }, []);

const loadTrashedFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await trashedFileService.getAll();
      // Map database fields to component expected format
      const mappedFiles = result.map(file => ({
        id: file.Id,
        name: file.Name,
        size: file.size,
        type: file.type,
        uploadDate: file.upload_date,
        modifiedDate: file.modified_date,
        deletedDate: file.deleted_date,
        path: file.path,
        isFolder: file.is_folder,
        parentId: file.parent_id,
        thumbnailUrl: file.thumbnail_url,
        shareUrl: file.share_url
      }));
      setTrashedFiles(mappedFiles);
    } catch (err) {
      setError(err.message || 'Failed to load trash');
      toast.error('Failed to load trash');
    } finally {
      setLoading(false);
    }
  };

const restoreFile = async (file) => {
    try {
      await trashedFileService.restoreFile(file.id);
      await loadTrashedFiles();
      toast.success(`${file.name} restored successfully`);
    } catch (err) {
      toast.error('Failed to restore file');
    }
  };

const permanentlyDeleteFile = async (file) => {
    if (window.confirm(`Are you sure you want to permanently delete "${file.name}"? This action cannot be undone.`)) {
      try {
        await trashedFileService.permanentlyDeleteFile(file.id);
        await loadTrashedFiles();
        toast.success(`${file.name} permanently deleted`);
      } catch (err) {
        toast.error('Failed to delete file permanently');
      }
    }
  };

const emptyTrash = async () => {
    if (window.confirm('Are you sure you want to permanently delete all files in trash? This action cannot be undone.')) {
      try {
        await trashedFileService.emptyTrash();
        await loadTrashedFiles();
        toast.success('Trash emptied successfully');
      } catch (err) {
        toast.error('Failed to empty trash');
      }
    }
  };

const restoreSelected = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      await Promise.all(selectedFiles.map(fileId => trashedFileService.restoreFile(fileId)));
      await loadTrashedFiles();
      setSelectedFiles([]);
      toast.success(`${selectedFiles.length} file(s) restored successfully`);
    } catch (err) {
      toast.error('Failed to restore selected files');
    }
  };

  const toggleSelectFile = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const selectAll = () => {
    if (selectedFiles.length === trashedFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(trashedFiles.map(file => file.id));
    }
  };

  if (loading) {
    return <LoadingSkeleton type="list" count={6} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadTrashedFiles} />;
  }

  if (trashedFiles.length === 0) {
    return (
      <EmptyState
        iconName="Trash2"
        title="Trash is empty"
        message="Deleted files will appear here"
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-900">Trash</h1>
          <p className="text-gray-500 mt-1">
            {trashedFiles.length} item{trashedFiles.length !== 1 ? 's' : ''} in trash
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {selectedFiles.length > 0 && (
            <Button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={restoreSelected}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ApperIcon name="RotateCcw" size={16} />
              <span>Restore ({selectedFiles.length})</span>
            </Button>
          )}
          
          {trashedFiles.length > 0 && (
            <Button
              onClick={emptyTrash}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ApperIcon name="Trash2" size={16} />
              <span>Empty Trash</span>
            </Button>
          )}
        </div>
      </div>

      {trashedFiles.length > 0 && (
        <div className="mb-4">
          <label className="flex items-center space-x-2 cursor-pointer w-fit">
            <Checkbox
              checked={selectedFiles.length === trashedFiles.length}
              onChange={selectAll}
            />
            <span className="text-sm text-gray-600">
              Select all ({trashedFiles.length})
            </span>
          </label>
        </div>
      )}

      <div className="space-y-2">
        {trashedFiles.map((file, index) => (
          <FileListItem
            key={file.id}
            file={file}
            index={index}
            isSelected={selectedFiles.includes(file.id)}
            onToggleSelect={toggleSelectFile}
            isTrash={true}
            showShareButton={false}
            showMoreIcon={false}
          >
            {/* Custom actions for trash items */}
            <div className="flex-shrink-0 flex items-center space-x-2">
                <Button
                  onClick={() => restoreFile(file)}
                  className="p-2 rounded-lg hover:bg-green-50 transition-colors"
                  title="Restore file"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ApperIcon name="RotateCcw" size={16} className="text-green-600" />
                </Button>
                
                <Button
                  onClick={() => permanentlyDeleteFile(file)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete permanently"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ApperIcon name="X" size={16} className="text-red-600" />
                </Button>
            </div>
          </FileListItem>
        ))}
      </div>
    </div>
  );
};

export default TrashedFilesList;