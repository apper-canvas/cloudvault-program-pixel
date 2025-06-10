import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const ErrorState = ({ message, onRetry }) => {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
                <ApperIcon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Operation Failed</h3>
                <p className="text-gray-500 mb-4">{message}</p>
                <Button
                    onClick={onRetry}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Try Again
                </Button>
            </div>
        </div>
    );
};

export default ErrorState;