import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button'; // Using the new Button atom

const Breadcrumbs = ({ pathSegments, onNavigateToRoot, onNavigateToSegment, showGoUp = false, currentPath = '' }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-sm flex-wrap"
        >
            <Button
                onClick={onNavigateToRoot}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-surface-100 transition-colors text-primary hover:text-primary/80"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <ApperIcon name="Home" size={16} />
                <span className="text-sm font-medium">My Files</span>
            </Button>
            
            {pathSegments.map((segment, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <ApperIcon name="ChevronRight" size={14} className="text-gray-400" />
                    <Button
                        onClick={() => onNavigateToSegment(index)}
                        className={`text-sm py-1 rounded transition-colors ${
                            index === pathSegments.length - 1 
                                ? 'text-gray-900 font-medium px-2' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-surface-100 px-2'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {segment}
                    </Button>
                </div>
            ))}
            
            {showGoUp && pathSegments.length > 0 && (
                <Button
                    onClick={() => onNavigateToSegment(pathSegments.length - 2)} // Navigate up one level
                    className="ml-4 p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
                    title="Go up one level"
                >
                    <ApperIcon name="ArrowUp" size={16} className="text-gray-500" />
                </Button>
            )}
        </motion.div>
    );
};

export default Breadcrumbs;