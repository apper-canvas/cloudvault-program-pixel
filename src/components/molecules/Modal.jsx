import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const Modal = ({ isOpen, onClose, title, children, actions, className }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        key="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={onClose}
                    />
                    <motion.div
                        key="modal-content"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`fixed inset-0 z-50 flex items-center justify-center p-4`}
                    >
                        <div 
                            className={`bg-white rounded-lg shadow-xl max-h-full overflow-hidden ${className || 'max-w-md w-full'}`}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                        >
                            <div className="flex items-center justify-between p-4 border-b">
                                <h3 className="font-medium text-gray-900">{title}</h3>
                                <Button 
                                    onClick={onClose} 
                                    className="p-2 rounded-lg hover:bg-gray-100" 
                                    whileHover={{ scale: 1.1 }} 
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <ApperIcon name="X" size={20} />
                                </Button>
                            </div>
                            <div className="p-4 max-h-96 overflow-auto">
                                {children}
                            </div>
                            {actions && actions.length > 0 && (
                                <div className="flex justify-end space-x-3 p-4 border-t">
                                    {actions.map((action, index) => (
                                        <div key={`action-${index}`}>{action}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Modal;