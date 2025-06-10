import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ onClick, children, className, whileHover, whileTap, ...props }) => {
    return (
        <motion.button
            onClick={onClick}
            className={className}
            whileHover={whileHover || { scale: 1.05 }}
            whileTap={whileTap || { scale: 0.95 }}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default Button;