import React from 'react';
import { formatFileSize, formatFileDate } from '@/utils/fileHelpers';

const FileDetails = ({ file, showPath = false, isRecent = false, isTrash = false, isShared = false }) => {
    return (
        <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium text-gray-900 truncate ${isTrash ? 'text-gray-700' : 'group-hover:text-primary transition-colors'}`} title={file.name}>
                {file.name}
            </h4>
<div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                <span>
                    {file.isFolder ? 'Folder' : formatFileSize(file.size)}
                </span>
                <span>•</span>
                {file.storageType && (
                    <>
                        <span>{file.storageType}</span>
                        <span>•</span>
                    </>
                )}
                {isShared && file.createdDate && (
                    <>
                        <span>Shared {formatFileDate(file.createdDate)}</span>
                        {file.expiryDate && (
                            <>
                                <span>•</span>
                                <span>Expires {formatFileDate(file.expiryDate)}</span>
                            </>
                        )}
                        <span>•</span>
                    </>
                )}
                {isTrash && file.deletedDate && (
                    <>
                        <span>Deleted {formatFileDate(file.deletedDate, true)}</span>
                        <span>•</span>
                    </>
                )}
                {!isTrash && !isShared && file.modifiedDate && (
                    <>
                        <span>{formatFileDate(file.modifiedDate, isRecent)}</span>
                        <span>•</span>
                    </>
                )}
                {showPath && <span className="truncate">{file.path || 'Root'}</span>}
            </div>
        </div>
    );
};

export default FileDetails;