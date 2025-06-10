import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import fileService from '../services/api/fileService';
import { formatDistanceToNow } from 'date-fns';

const Trash = () => {
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
      const result = await fileService.getTrashedFiles();
      setTrashedFiles(result);
    } catch (err) {
      setError(err.message || 'Failed to load trash');
      toast.error('Failed to load trash');
    } finally {
      setLoading(false);
    }
  };

  const restoreFile = async (file) => {
    try {
      await fileService.restoreFile(file.id);
      await loadTrashedFiles();
      toast.success(`${file.name} restored successfully`);
    } catch (err) {
      toast.error('Failed to restore file');
    }
  };

  const permanentlyDeleteFile = async (file) => {
    if (window.confirm(`Are you sure you want to permanently delete "${file.name}"? This action cannot be undone.`)) {
      try {
        await fileService.permanentlyDeleteFile(file.id);
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
        await fileService.emptyTrash();
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
      await Promise.all(selectedFiles.map(fileId => fileService.restoreFile(fileId)));
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.isFolder) return 'Folder';
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return 'Image';
    if (['pdf'].includes(ext)) return 'FileText';
    if (['doc', 'docx'].includes(ext)) return 'FileText';
    if (['xls', 'xlsx'].includes(ext)) return 'FileSpreadsheet';
    if (['zip', 'rar', '7z'].includes(ext)) return 'Archive';
    if (['mp4', 'avi', 'mov'].includes(ext)) return 'Video';
    if (['mp3', 'wav', 'flac'].includes(ext)) return 'Music';
    return 'File';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <ApperIcon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load trash</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadTrashedFiles}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (trashedFiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <ApperIcon name="Trash2" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Trash is empty</h3>
          <p className="text-gray-500">Deleted files will appear here</p>
        </motion.div>
      </div>
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
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={restoreSelected}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ApperIcon name="RotateCcw" size={16} />
              <span>Restore ({selectedFiles.length})</span>
            </motion.button>
          )}
          
          {trashedFiles.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={emptyTrash}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ApperIcon name="Trash2" size={16} />
              <span>Empty Trash</span>
            </motion.button>
          )}
        </div>
      </div>

      {trashedFiles.length > 0 && (
        <div className="mb-4">
          <label className="flex items-center space-x-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={selectedFiles.length === trashedFiles.length}
              onChange={selectAll}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-600">
              Select all ({trashedFiles.length})
            </span>
          </label>
        </div>
      )}

      <div className="space-y-2">
        {trashedFiles.map((file, index) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${
              selectedFiles.includes(file.id) ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
          >
            <div className="flex items-center space-x-4">
              <label className="flex-shrink-0">
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file.id)}
                  onChange={() => toggleSelectFile(file.id)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </label>
              
              <div className="flex-shrink-0">
                {file.thumbnailUrl ? (
                  <img 
                    src={file.thumbnailUrl} 
                    alt={file.name}
                    className="w-10 h-10 object-cover rounded opacity-60"
                  />
                ) : (
                  <div className="w-10 h-10 bg-surface-100 rounded flex items-center justify-center">
                    <ApperIcon 
                      name={getFileIcon(file)} 
                      size={20} 
                      className={`opacity-60 ${file.isFolder ? 'text-blue-500' : 'text-gray-400'}`} 
                    />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-700 truncate">
                  {file.name}
                </h4>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <span>
                    {file.isFolder ? 'Folder' : formatFileSize(file.size)}
                  </span>
                  <span>•</span>
                  <span>
                    Deleted {formatDistanceToNow(new Date(file.deletedDate), { addSuffix: true })}
                  </span>
                  <span>•</span>
                  <span className="truncate">{file.path || 'Root'}</span>
                </div>
              </div>
              
              <div className="flex-shrink-0 flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => restoreFile(file)}
                  className="p-2 rounded-lg hover:bg-green-50 transition-colors"
                  title="Restore file"
                >
                  <ApperIcon name="RotateCcw" size={16} className="text-green-600" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => permanentlyDeleteFile(file)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete permanently"
                >
                  <ApperIcon name="X" size={16} className="text-red-600" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Trash;