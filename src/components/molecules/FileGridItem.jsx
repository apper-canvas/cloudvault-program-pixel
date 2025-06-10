import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import FileIconDisplay from '@/components/molecules/FileIconDisplay';
import FileDetails from '@/components/molecules/FileDetails';

const FileGridItem = ({ file, onClick, onContextMenu, showShareButton = true, index }) => {
return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
            onClick={onClick}
            onContextMenu={onContextMenu}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex flex-col items-center text-center">
                <FileIconDisplay file={file} size={48} className="mb-2" />
                <FileDetails file={file} isRecent={true} /> {/* Pass file directly for details */}
            </div>
            {showShareButton && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // This button's share functionality should be handled by parent
                            // or passed as a prop from the organism (FileExplorer)
                            // For now, assuming direct share logic in parent
                            if (onContextMenu) {
                                onContextMenu(e, file, 'share'); // Trigger share directly from here if needed
                            }
                        }}
                        className="p-1 rounded hover:bg-gray-100"
                    >
                        <ApperIcon name="Share2" size={14} className="text-gray-500" />
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default FileGridItem;