import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadProgressItem from '@/components/molecules/UploadProgressItem';

const UploadQueue = ({ uploads }) => {
    return (
        <AnimatePresence>
            {uploads.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80 max-h-60 overflow-y-auto z-30"
                >
                    <h4 className="font-medium text-gray-900 mb-3">Uploading Files</h4>
                    <div className="space-y-2">
                        {uploads.map(upload => (
                            <UploadProgressItem key={upload.id} upload={upload} />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UploadQueue;