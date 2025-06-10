import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import { getFileIcon } from '@/utils/fileHelpers';

const FileIconDisplay = ({ file, size = 32, className = '', isDimmed = false }) => {
    const iconClassName = `${file.isFolder ? 'text-blue-500' : 'text-gray-400'} ${isDimmed ? 'opacity-60' : ''}`;

    if (file.thumbnailUrl) {
        return (
            <img 
                src={file.thumbnailUrl} 
                alt={file.name}
                className={`object-cover rounded ${className}`}
                style={{ width: size, height: size }}
            />
        );
    }

    return (
        <div className={`bg-surface-100 rounded flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            <ApperIcon 
                name={getFileIcon(file)} 
                size={size * 0.6} // Make icon slightly smaller than container
                className={iconClassName} 
            />
        </div>
    );
};

export default FileIconDisplay;