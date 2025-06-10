import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const EmptyState = ({ iconName, title, message, actionButtonText, onActionButtonClick, isDragActive, onDragEnter, onDragLeave, onDragOver, onDrop }) => {
    return (
        <div 
            className={`relative h-full flex items-center justify-center transition-all ${isDragActive ? 'bg-primary/5 border-primary' : ''}`}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
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
                    <ApperIcon name={iconName} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 mb-6">{message}</p>
                {onActionButtonClick && actionButtonText && (
                    <Button onClick={onActionButtonClick} className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                        {actionButtonText}
                    </Button>
                )}
            </motion.div>
            
            {isDragActive && (
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
};

export default EmptyState;