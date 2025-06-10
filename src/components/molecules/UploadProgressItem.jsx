import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const UploadProgressItem = ({ upload }) => {
    return (
        <div className="flex items-center space-x-3">
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
    );
};

export default UploadProgressItem;