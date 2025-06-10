import React from 'react';

const Input = ({ type = 'text', value, onChange, placeholder, className, readOnly, ...props }) => {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={readOnly}
            className={`w-full px-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all ${className || ''}`}
            {...props}
        />
    );
};

export default Input;