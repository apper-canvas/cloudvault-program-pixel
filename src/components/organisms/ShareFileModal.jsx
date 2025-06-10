import React from 'react';
import Modal from '@/components/molecules/Modal';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';

const ShareFileModal = ({ file, shareLinkUrl, isOpen, onClose, onCopyLink }) => {
    if (!file || !shareLinkUrl) return null;

    const modalActions = [
        <Button 
            key="copy" 
            onClick={() => onCopyLink(shareLinkUrl)} 
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
            Copy Link
        </Button>,
        <Button 
            key="close" 
            onClick={onClose} 
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
            Close
        </Button>
    ];

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Share File"
        >
            <div className="p-4">
                <p className="text-sm text-gray-500 mb-4">
                    Anyone with this link can view and download "{file.name}"
                </p>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg mb-4">
                    <Input
                        type="text"
                        value={shareLinkUrl}
                        readOnly
                        className="flex-1 bg-transparent text-sm text-gray-700 outline-none p-0 border-none focus:ring-0"
                    />
                    <Button
                        onClick={() => onCopyLink(shareLinkUrl)}
                        className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90 transition-colors"
                    >
                        Copy
                    </Button>
                </div>
                <div className="flex justify-end space-x-3">
                    {modalActions}
                </div>
            </div>
        </Modal>
    );
};

export default ShareFileModal;