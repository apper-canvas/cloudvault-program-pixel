import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import FileIconDisplay from '@/components/molecules/FileIconDisplay';
import FileDetails from '@/components/molecules/FileDetails';
import Checkbox from '@/components/atoms/Checkbox';

const FileListItem = ({ file, onClick, onContextMenu, showShareButton = true, showMoreIcon = true, index, isSelected = false, onToggleSelect, isTrash = false, isShared = false }) => {
    const itemClassName = `bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center space-x-3 group ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''}`;

    return (
        <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={itemClassName}
            onClick={isTrash ? (e) => { e.stopPropagation(); onToggleSelect(file.id); } : onClick} // Default click action for files
            onContextMenu={onContextMenu}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {isTrash && onToggleSelect && (
                <label className="flex-shrink-0">
                    <Checkbox
                        checked={isSelected}
                        onChange={() => onToggleSelect(file.id)}
                        onClick={(e) => e.stopPropagation()} // Prevent parent click handler
                    />
                </label>
            )}

            <div className="flex-shrink-0">
                <FileIconDisplay file={file} size={40} isDimmed={isTrash} />
            </div>

            <FileDetails 
                file={file} 
                showPath={true} 
                isRecent={!isTrash && !isShared} 
                isTrash={isTrash} 
                isShared={isShared} 
            />

            <div className="flex-shrink-0 flex items-center space-x-1">
                {showShareButton && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onContextMenu) {
                                onContextMenu(e, file, 'share');
                            }
                        }}
                        className={`p-1 rounded hover:bg-gray-100 ${isTrash ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                    >
                        <ApperIcon name="Share2" size={16} className="text-gray-500" />
                    </button>
                )}
                {showMoreIcon && (
                    <ApperIcon name="MoreVertical" size={16} className="text-gray-400" />
                )}
            </div>
        </motion.div>
    );
};

export default FileListItem;