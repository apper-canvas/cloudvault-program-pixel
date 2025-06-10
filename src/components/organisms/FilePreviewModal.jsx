import React from 'react';
import Modal from '@/components/molecules/Modal';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const FilePreviewModal = ({ file, isOpen, onClose, onDownload }) => {
    if (!file) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={file.name} 
            className="max-w-4xl w-full"
        >
            <div className="space-y-4">
                {/* File Preview Content */}
                <div className="max-h-96 overflow-auto">
                    {file.type && file.type.startsWith('image/') ? (
                        <img 
                            src={file.thumbnailUrl || '/placeholder-image.jpg'} 
                            alt={file.name}
                            className="max-w-full h-auto mx-auto"
                        />
                    ) : file.type === 'text/plain' ? (
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                            Sample text content for {file.name}
                        </pre>
                    ) : (
                        <div className="text-center py-8">
                            <ApperIcon name="FileText" size={48} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Preview not available for this file type</p>
                        </div>
                    )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button 
                        key="preview-close"
                        onClick={onClose} 
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </Button>
                    <Button 
                        key="preview-download"
                        onClick={() => onDownload(file)} 
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Download
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default FilePreviewModal;