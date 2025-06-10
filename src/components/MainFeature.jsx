import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from './ApperIcon';
import fileService from '../services/api/fileService';
import uploadService from '../services/api/uploadService';
import shareService from '../services/api/shareService';
import { formatDistanceToNow, format } from 'date-fns';

const MainFeature = ({ currentPath = '', viewMode = 'grid', onNavigate }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [showShareDialog, setShowShareDialog] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  
  const fileInputRef = useRef();

  useEffect(() => {
    loadFiles();
  }, [currentPath]);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fileService.getFilesByPath(currentPath);
      setFiles(result);
    } catch (err) {
      setError(err.message || 'Failed to load files');
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragActive(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      await uploadFiles(droppedFiles);
    }
  };

  const uploadFiles = async (fileList) => {
    setUploading(true);
    const uploads = Array.from(fileList).map(file => ({
      id: Date.now() + Math.random(),
      file,
      progress: 0,
      status: 'uploading'
    }));
    
    setUploadQueue(uploads);

    try {
      for (const upload of uploads) {
        const result = await uploadService.uploadFile(upload.file, currentPath, (progress) => {
          setUploadQueue(prev => prev.map(u => 
            u.id === upload.id ? { ...u, progress } : u
          ));
        });
        
        setUploadQueue(prev => prev.map(u => 
          u.id === upload.id ? { ...u, status: 'completed' } : u
        ));
      }
      
      await loadFiles();
      toast.success(`${uploads.length} file(s) uploaded successfully`);
      
      setTimeout(() => {
        setUploadQueue([]);
      }, 2000);
      
    } catch (err) {
      toast.error('Upload failed');
      setUploadQueue(prev => prev.map(u => ({ ...u, status: 'error' })));
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
  };

  const handleFileClick = (file) => {
    if (file.isFolder) {
      onNavigate?.(file.path);
    } else if (['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf'].includes(file.type)) {
      setPreviewFile(file);
    } else {
      downloadFile(file);
    }
  };

  const downloadFile = async (file) => {
    try {
      await fileService.downloadFile(file.id);
      toast.success(`Downloading ${file.name}`);
    } catch (err) {
      toast.error('Download failed');
    }
  };

  const deleteFile = async (file) => {
    if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      try {
        await fileService.deleteFile(file.id);
        await loadFiles();
        toast.success(`${file.name} deleted successfully`);
      } catch (err) {
        toast.error('Delete failed');
      }
    }
  };

  const shareFile = async (file) => {
    try {
      const shareLink = await shareService.createShareLink(file.id);
      setShowShareDialog({ file, shareLink });
    } catch (err) {
      toast.error('Failed to create share link');
    }
  };

  const copyShareLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Share link copied to clipboard');
    setShowShareDialog(null);
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

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      file
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    document.addEventListener('click', closeContextMenu);
    return () => document.removeEventListener('click', closeContextMenu);
  }, []);

  if (loading && files.length === 0) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-lg p-4 shadow-sm"
            >
              <div className="animate-pulse space-y-3">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </motion.div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load files</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadFiles}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (files.length === 0 && !loading) {
    return (
      <div 
        className={`relative h-full flex items-center justify-center transition-all ${
          dragActive ? 'bg-primary/5 border-primary' : ''
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-8"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <ApperIcon name="FolderOpen" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">This folder is empty</h3>
          <p className="text-gray-500 mb-6">Drag files here or click to upload</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Upload Files
          </motion.button>
        </motion.div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {dragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 border-2 border-dashed border-primary bg-primary/5 rounded-lg flex items-center justify-center"
          >
            <div className="text-center">
              <ApperIcon name="Upload" size={48} className="text-primary mx-auto mb-2" />
              <p className="text-primary font-medium">Drop files here to upload</p>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`relative h-full p-6 transition-all ${
        dragActive ? 'bg-primary/5' : ''
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* File Grid/List */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4" 
        : "space-y-2"
      }>
        {files.map((file, index) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              ${viewMode === 'grid' 
                ? "bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group" 
                : "bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center space-x-3"
              }
            `}
            onClick={() => handleFileClick(file)}
            onContextMenu={(e) => handleContextMenu(e, file)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {viewMode === 'grid' ? (
              <>
                <div className="flex flex-col items-center text-center">
                  {file.thumbnailUrl ? (
                    <img 
                      src={file.thumbnailUrl} 
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded mb-2"
                    />
                  ) : (
                    <ApperIcon 
                      name={getFileIcon(file)} 
                      size={32} 
                      className={`mb-2 ${file.isFolder ? 'text-blue-500' : 'text-gray-400'}`} 
                    />
                  )}
                  <h4 className="text-sm font-medium text-gray-900 truncate w-full" title={file.name}>
                    {file.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {file.isFolder ? 'Folder' : formatFileSize(file.size)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(file.modifiedDate), { addSuffix: true })}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      shareFile(file);
                    }}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <ApperIcon name="Share2" size={14} className="text-gray-500" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex-shrink-0">
                  {file.thumbnailUrl ? (
                    <img 
                      src={file.thumbnailUrl} 
                      alt={file.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <ApperIcon 
                      name={getFileIcon(file)} 
                      size={20} 
                      className={file.isFolder ? 'text-blue-500' : 'text-gray-400'} 
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{file.name}</h4>
                  <p className="text-xs text-gray-500">
                    {format(new Date(file.modifiedDate), 'MMM dd, yyyy')} • {file.isFolder ? 'Folder' : formatFileSize(file.size)}
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      shareFile(file);
                    }}
                    className="p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ApperIcon name="Share2" size={16} className="text-gray-500" />
                  </button>
                  <ApperIcon name="MoreVertical" size={16} className="text-gray-400" />
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Upload Queue */}
      <AnimatePresence>
        {uploadQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80 max-h-60 overflow-y-auto z-30"
          >
            <h4 className="font-medium text-gray-900 mb-3">Uploading Files</h4>
            <div className="space-y-2">
              {uploadQueue.map(upload => (
                <div key={upload.id} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 truncate">{upload.file.name}</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <motion.div
                        className="bg-primary h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${upload.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {upload.status === 'completed' ? (
                      <ApperIcon name="CheckCircle" size={16} className="text-green-500" />
                    ) : upload.status === 'error' ? (
                      <ApperIcon name="XCircle" size={16} className="text-red-500" />
                    ) : (
                      <span className="text-xs text-gray-500">{Math.round(upload.progress)}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div 
              className="fixed inset-0 z-20"
              onClick={closeContextMenu}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed bg-white rounded-lg shadow-lg border py-2 z-30"
              style={{ 
                left: contextMenu.x, 
                top: contextMenu.y,
                transform: 'translate(-50%, -10px)'
              }}
            >
              <button
                onClick={() => {
                  downloadFile(contextMenu.file);
                  closeContextMenu();
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <ApperIcon name="Download" size={16} />
                <span>Download</span>
              </button>
              <button
                onClick={() => {
                  shareFile(contextMenu.file);
                  closeContextMenu();
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <ApperIcon name="Share2" size={16} />
                <span>Share</span>
              </button>
              <hr className="my-1" />
              <button
                onClick={() => {
                  deleteFile(contextMenu.file);
                  closeContextMenu();
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center space-x-2"
              >
                <ApperIcon name="Trash2" size={16} />
                <span>Delete</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* File Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setPreviewFile(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-full w-full overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-medium text-gray-900">{previewFile.name}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => downloadFile(previewFile)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      <ApperIcon name="Download" size={20} />
                    </button>
                    <button
                      onClick={() => setPreviewFile(null)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      <ApperIcon name="X" size={20} />
                    </button>
                  </div>
                </div>
                <div className="p-4 max-h-96 overflow-auto">
                  {previewFile.type.startsWith('image/') ? (
                    <img 
                      src={previewFile.thumbnailUrl || '/placeholder-image.jpg'} 
                      alt={previewFile.name}
                      className="max-w-full h-auto mx-auto"
                    />
                  ) : previewFile.type === 'text/plain' ? (
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      Sample text content for {previewFile.name}
                    </pre>
                  ) : (
                    <div className="text-center py-8">
                      <ApperIcon name="FileText" size={48} className="text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Preview not available for this file type</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Share Dialog */}
      <AnimatePresence>
        {showShareDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowShareDialog(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Share File</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Anyone with this link can view and download "{showShareDialog.file.name}"
                </p>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg mb-4">
                  <input
                    type="text"
                    value={showShareDialog.shareLink.url}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                  />
                  <button
                    onClick={() => copyShareLink(showShareDialog.shareLink.url)}
                    className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90 transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowShareDialog(null)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Drag Overlay */}
      <AnimatePresence>
        {dragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 border-2 border-dashed border-primary bg-primary/5 rounded-lg flex items-center justify-center z-10"
          >
            <div className="text-center">
              <ApperIcon name="Upload" size={48} className="text-primary mx-auto mb-2" />
              <p className="text-primary font-medium">Drop files here to upload</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

export default MainFeature;