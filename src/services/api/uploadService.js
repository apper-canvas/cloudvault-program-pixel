const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class UploadService {
  async uploadFile(file, path = '', onProgress) {
    // Simulate chunked upload with progress
    const chunks = Math.ceil(file.size / (1024 * 1024)); // 1MB chunks
    const chunkDelay = Math.max(100, Math.min(500, file.size / 1000000)); // Adjust delay based on file size
    
    for (let i = 0; i <= chunks; i++) {
      await delay(chunkDelay);
      const progress = Math.min(100, (i / chunks) * 100);
      onProgress?.(progress);
    }
    
    // Create file object
    const newFile = {
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      path: path,
      isFolder: false,
      parentId: path ? path.split('/').pop() : null,
      uploadDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      shareUrl: null
    };
    
    return newFile;
  }

  async uploadMultipleFiles(files, path = '', onProgress) {
    const results = [];
    const totalFiles = files.length;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      const result = await this.uploadFile(file, path, (fileProgress) => {
        const overallProgress = ((i / totalFiles) * 100) + (fileProgress / totalFiles);
        onProgress?.(Math.min(100, overallProgress));
      });
      
      results.push(result);
    }
    
    return results;
  }

  async createFolder(name, path = '') {
    await delay(200);
    
    const newFolder = {
      id: Date.now().toString(),
      name: name,
      size: 0,
      type: 'folder',
      path: path,
      isFolder: true,
      parentId: path ? path.split('/').pop() : null,
      uploadDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      thumbnailUrl: null,
      shareUrl: null
    };
    
    return newFolder;
  }
}

export default new UploadService();