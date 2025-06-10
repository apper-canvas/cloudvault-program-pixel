import React from 'react';

const Checkbox = ({ checked, onChange, className, ...props }) => {
    return (
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className={`rounded border-gray-300 text-primary focus:ring-primary ${className || ''}`}
            {...props}
        />
    );
};

export default Checkbox;