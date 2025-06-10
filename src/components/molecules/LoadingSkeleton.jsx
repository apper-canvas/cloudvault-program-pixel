import React from 'react';
import { motion } from 'framer-motion';

const LoadingSkeleton = ({ type = 'grid', count = 8 }) => {
    return (
        <div className="p-6">
            {type === 'page-header' && (
                <div className="mb-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                </div>
            )}
            <div className={type === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-3"}>
                {[...Array(count)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-lg p-4 shadow-sm"
                    >
                        <div className="animate-pulse space-y-3">
                            <div className="h-12 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default LoadingSkeleton;