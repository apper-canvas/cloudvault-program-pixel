import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import shareService from '@/services/api/shareService';
import Button from '@/components/atoms/Button';
import LoadingSkeleton from '@/components/molecules/LoadingSkeleton';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import FileListItem from '@/components/molecules/FileListItem';
import ShareLinkDisplay from '@/components/molecules/ShareLinkDisplay';

const SharedFilesList = () => {
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

  if (loading) {
    return <LoadingSkeleton type="list" count={6} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadSharedFiles} />;
  }

  if (sharedFiles.length === 0) {
    return (
      <EmptyState
        iconName="Share2"
        title="No shared files"
        message="Files you've shared will appear here"
      />
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
          <FileListItem
            key={shareData.id}
            file={shareData.file}
            index={index}
            onClick={() => {}} // No direct click action for shared item as it has copy/revoke
            showShareButton={false}
            showMoreIcon={false} // Actions are explicit
            isShared={true}
          >
            {/* Custom content for shared files, placing actions here */}
            <ShareLinkDisplay url={shareData.url} onCopy={() => copyShareLink(shareData.url)} />
            <div className="flex-shrink-0 flex items-center space-x-2">
                <Button
                  onClick={() => copyShareLink(shareData.url)}
                  className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                  title="Copy link"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ApperIcon name="Copy" size={16} className="text-gray-500" />
                </Button>
                
                <Button
                  onClick={() => revokeShareLink(shareData.id)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Revoke access"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ApperIcon name="Trash2" size={16} className="text-red-500" />
                </Button>
            </div>
          </FileListItem>
        ))}
      </div>
    </div>
  );
};

export default SharedFilesList;