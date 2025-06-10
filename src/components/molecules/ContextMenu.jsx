import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const ContextMenu = ({ x, y, isOpen, onClose, items }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed bg-white rounded-lg shadow-lg border py-2 z-30"
                style={{ 
                    left: x, 
                    top: y,
                    transform: 'translate(-50%, -10px)' // Adjust position slightly up and left
                }}
                ref={menuRef}
            >
                {items.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => { item.onClick(); onClose(); }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 ${item.isDestructive ? 'text-red-600' : ''}`}
                    >
                        <ApperIcon name={item.icon} size={16} />
                        <span>{item.label}</span>
                    </button>
                ))}
            </motion.div>
        </AnimatePresence>
    );
};

export default ContextMenu;