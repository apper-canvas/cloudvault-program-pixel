import React from 'react';
import UploadQueue from '@/components/molecules/UploadQueue';

const UploadQueueDisplay = ({ uploadQueue }) => {
    return <UploadQueue uploads={uploadQueue} />;
};

export default UploadQueueDisplay;