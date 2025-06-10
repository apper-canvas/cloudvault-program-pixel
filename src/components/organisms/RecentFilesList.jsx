import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import fileService from '@/services/api/fileService';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import LoadingSkeleton from '@/components/molecules/LoadingSkeleton';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import FileListItem from '@/components/molecules/FileListItem';

const RecentFilesList = () => {
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

  const downloadFile = async (file) => {
    try {
      await fileService.downloadFile(file.id);
      toast.success(`Downloading ${file.name}`);
    } catch (err) {
      toast.error('Download failed');
    }
  };

  if (loading) {
    return <LoadingSkeleton type="list" count={8} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadRecentFiles} />;
  }

  if (recentFiles.length === 0) {
    return (
      <EmptyState
        iconName="Clock"
        title="No recent files"
        message="Files you've accessed recently will appear here"
      />
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
          <FileListItem
            key={file.id}
            file={file}
            index={index}
            onClick={() => downloadFile(file)}
            showShareButton={false} // Recent files list doesn't have direct share button on item
            showMoreIcon={false} // No context menu for recent files
          />
        ))}
      </div>
    </div>
  );
};

export default RecentFilesList;