import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import fileService from '../services/api/fileService';
import { formatDistanceToNow } from 'date-fns';

const Recent = () => {
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecentFiles();
  }, []);

  const loadRecentFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fileService.getRecentFiles();
      setRecentFiles(result);
    } catch (err) {
      setError(err.message || 'Failed to load recent files');
      toast.error('Failed to load recent files');
    } finally {
      setLoading(false);
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

  const downloadFile = async (file) => {
    try {
      await fileService.downloadFile(file.id);
      toast.success(`Downloading ${file.name}`);
    } catch (err) {
      toast.error('Download failed');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
              <div className="flex items-center space-x-3">
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load recent files</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadRecentFiles}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (recentFiles.length === 0) {
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
            <ApperIcon name="Clock" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recent files</h3>
          <p className="text-gray-500">Files you've accessed recently will appear here</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-semibold text-gray-900">Recent Files</h1>
        <p className="text-gray-500 mt-1">Files you've accessed in the last 30 days</p>
      </div>

      <div className="space-y-2">
        {recentFiles.map((file, index) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            onClick={() => downloadFile(file)}
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {file.thumbnailUrl ? (
                  <img 
                    src={file.thumbnailUrl} 
                    alt={file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-surface-100 rounded flex items-center justify-center">
                    <ApperIcon 
                      name={getFileIcon(file)} 
                      size={20} 
                      className={file.isFolder ? 'text-blue-500' : 'text-gray-400'} 
                    />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                  {file.name}
                </h4>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <span>
                    {file.isFolder ? 'Folder' : formatFileSize(file.size)}
                  </span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(file.modifiedDate), { addSuffix: true })}
                  </span>
                  <span>•</span>
                  <span className="truncate">{file.path || 'Root'}</span>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadFile(file);
                  }}
                  className="p-2 rounded-lg hover:bg-surface-100 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <ApperIcon name="Download" size={16} className="text-gray-500" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Recent;