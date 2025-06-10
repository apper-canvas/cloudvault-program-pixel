import React from 'react';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';

const ShareLinkDisplay = ({ url, onCopy }) => {
    return (
        <div className="flex items-center space-x-2 mt-2 p-2 bg-gray-50 rounded text-xs">
            <Input
                type="text"
                value={url}
                readOnly
                className="flex-1 bg-transparent text-sm text-gray-600 outline-none p-0 border-none focus:ring-0"
                style={{ fontFamily: 'monospace' }}
            />
            <Button
                onClick={onCopy}
                className="text-primary hover:text-primary/80 font-medium px-2 py-1 bg-transparent hover:bg-transparent" // Adjust button styling
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Copy
            </Button>
        </div>
    );
};

export default ShareLinkDisplay;