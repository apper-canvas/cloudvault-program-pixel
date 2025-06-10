import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import shareService from '../services/api/shareService';
import { format } from 'date-fns';

const Shared = () => {
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSharedFiles();
  }, []);

  const loadSharedFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await shareService.getSharedFiles();
      setSharedFiles(result);
    } catch (err) {
      setError(err.message || 'Failed to load shared files');
      toast.error('Failed to load shared files');
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Share link copied to clipboard');
  };

  const revokeShareLink = async (shareId) => {
    if (window.confirm('Are you sure you want to revoke this share link?')) {
      try {
        await shareService.revokeShareLink(shareId);
        await loadSharedFiles();
        toast.success('Share link revoked successfully');
      } catch (err) {
        toast.error('Failed to revoke share link');
      }
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
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded"></div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load shared files</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadSharedFiles}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (sharedFiles.length === 0) {
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
            <ApperIcon name="Share2" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No shared files</h3>
          <p className="text-gray-500">Files you've shared will appear here</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-semibold text-gray-900">Shared Files</h1>
        <p className="text-gray-500 mt-1">Manage files you've shared with others</p>
      </div>

      <div className="space-y-3">
        {sharedFiles.map((shareData, index) => (
          <motion.div
            key={shareData.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {shareData.file.thumbnailUrl ? (
                  <img 
                    src={shareData.file.thumbnailUrl} 
                    alt={shareData.file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-surface-100 rounded flex items-center justify-center">
                    <ApperIcon 
                      name={getFileIcon(shareData.file)} 
                      size={20} 
                      className={shareData.file.isFolder ? 'text-blue-500' : 'text-gray-400'} 
                    />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {shareData.file.name}
                </h4>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <span>
                    {shareData.file.isFolder ? 'Folder' : formatFileSize(shareData.file.size)}
                  </span>
                  <span>•</span>
                  <span>
                    Shared {format(new Date(shareData.createdDate), 'MMM dd, yyyy')}
                  </span>
                  {shareData.expiryDate && (
                    <>
                      <span>•</span>
                      <span>
                        Expires {format(new Date(shareData.expiryDate), 'MMM dd, yyyy')}
                      </span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 mt-2 p-2 bg-gray-50 rounded text-xs">
                  <span className="flex-1 text-gray-600 truncate font-mono">
                    {shareData.url}
                  </span>
                  <button
                    onClick={() => copyShareLink(shareData.url)}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="flex-shrink-0 flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => copyShareLink(shareData.url)}
                  className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                  title="Copy link"
                >
                  <ApperIcon name="Copy" size={16} className="text-gray-500" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => revokeShareLink(shareData.id)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Revoke access"
                >
                  <ApperIcon name="Trash2" size={16} className="text-red-500" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Shared;