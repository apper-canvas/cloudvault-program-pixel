import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import fileService from '@/services/api/fileService';
import uploadService from '@/services/api/uploadService';
import shareService from '@/services/api/shareService';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import LoadingSkeleton from '@/components/molecules/LoadingSkeleton';
import FileGridItem from '@/components/molecules/FileGridItem';
import FileListItem from '@/components/molecules/FileListItem';
import ContextMenu from '@/components/molecules/ContextMenu';
import FilePreviewModal from '@/components/organisms/FilePreviewModal';
import ShareFileModal from '@/components/organisms/ShareFileModal';
import UploadQueueDisplay from '@/components/organisms/UploadQueueDisplay';

const FileExplorer = ({ currentPath = '', viewMode = 'grid', onNavigate, searchQuery = '' }) => {
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

  // Handle custom event for file uploads triggered from parent components (e.g., HomePage)
  useEffect(() => {
    const handleFileUploadEvent = async (event) => {
      const { files: newFiles, path: uploadPath } = event.detail;
      if (uploadPath === currentPath) {
        await uploadFiles(newFiles);
      }
    };
    document.addEventListener('file-upload', handleFileUploadEvent);
    return () => {
      document.removeEventListener('file-upload', handleFileUploadEvent);
    };
  }, [currentPath]); // Re-attach listener if currentPath changes

const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fileService.getFilesByPath(currentPath);
      // Map database fields to component expected format
      const mappedFiles = result.map(file => ({
        id: file.Id,
        name: file.Name,
        size: file.size,
        type: file.type,
        uploadDate: file.upload_date,
        modifiedDate: file.modified_date,
        path: file.path,
        isFolder: file.is_folder,
        parentId: file.parent_id,
        thumbnailUrl: file.thumbnail_url,
        shareUrl: file.share_url
      }));
      
      // Filter files based on search query if provided
      const filteredResult = searchQuery 
        ? mappedFiles.filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : mappedFiles;
      setFiles(filteredResult);
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
    
    setUploadQueue(prev => [...prev, ...uploads]);

    try {
      for (const upload of uploads) {
        await uploadService.uploadFile(upload.file, currentPath, (progress) => {
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
        setUploadQueue(prev => prev.filter(u => !uploads.some(uploaded => uploaded.id === u.id && uploaded.status === 'completed')));
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
    } else if (file.type && (file.type.startsWith('image/') || ['text/plain', 'application/pdf'].includes(file.type))) {
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
    return <LoadingSkeleton type={viewMode} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadFiles} />;
  }

  if (files.length === 0 && !loading) {
    return (
      <EmptyState 
        iconName="FolderOpen"
        title="This folder is empty"
        message="Drag files here or click to upload"
        actionButtonText="Upload Files"
        onActionButtonClick={() => fileInputRef.current?.click()}
        isDragActive={dragActive}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </EmptyState>
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
{files.map((file, index) => {
          const commonProps = {
            file,
            onClick: () => handleFileClick(file),
            onContextMenu: (e) => handleContextMenu(e, file),
            index
          };
          return viewMode === 'grid' ? (
            <FileGridItem key={file.id} {...commonProps} />
          ) : (
            <FileListItem key={file.id} {...commonProps} />
          );
        })}
      </div>

      <UploadQueueDisplay uploadQueue={uploadQueue} />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isOpen={!!contextMenu}
          onClose={closeContextMenu}
          items={[
            { label: 'Download', icon: 'Download', onClick: () => downloadFile(contextMenu.file) },
            { label: 'Share', icon: 'Share2', onClick: () => shareFile(contextMenu.file) },
            { type: 'divider' }, // Not rendered, just a conceptual separator
            { label: 'Delete', icon: 'Trash2', onClick: () => deleteFile(contextMenu.file), isDestructive: true }
          ]}
        />
      )}

      <FilePreviewModal 
        file={previewFile} 
        isOpen={!!previewFile} 
        onClose={() => setPreviewFile(null)} 
        onDownload={downloadFile} 
      />

      <ShareFileModal 
        file={showShareDialog?.file} 
        shareLinkUrl={showShareDialog?.shareLink?.url} 
        isOpen={!!showShareDialog} 
        onClose={() => setShowShareDialog(null)} 
        onCopyLink={copyShareLink} 
      />

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

export default FileExplorer;