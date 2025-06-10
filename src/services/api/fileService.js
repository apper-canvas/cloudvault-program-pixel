import filesData from '../mockData/files.json';
import trashedFilesData from '../mockData/trashedFiles.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class FileService {
  constructor() {
    this.files = [...filesData];
    this.trashedFiles = [...trashedFilesData];
  }

  async getAll() {
    await delay(300);
    return [...this.files];
  }

  async getById(id) {
    await delay(200);
    const file = this.files.find(f => f.id === id);
    if (!file) throw new Error('File not found');
    return { ...file };
  }

  async getFilesByPath(path = '') {
    await delay(300);
    const filteredFiles = this.files.filter(file => file.path === path);
    return [...filteredFiles];
  }

  async getRecentFiles() {
    await delay(300);
    const recentFiles = this.files
      .filter(file => {
        const modifiedDate = new Date(file.modifiedDate);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return modifiedDate > thirtyDaysAgo;
      })
      .sort((a, b) => new Date(b.modifiedDate) - new Date(a.modifiedDate))
      .slice(0, 20);
    return [...recentFiles];
  }

  async getTrashedFiles() {
    await delay(300);
    return [...this.trashedFiles];
  }

  async create(fileData) {
    await delay(400);
    const newFile = {
      id: Date.now().toString(),
      ...fileData,
      uploadDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString()
    };
    this.files.push(newFile);
    return { ...newFile };
  }

  async update(id, data) {
    await delay(300);
    const index = this.files.findIndex(f => f.id === id);
    if (index === -1) throw new Error('File not found');
    
    this.files[index] = {
      ...this.files[index],
      ...data,
      modifiedDate: new Date().toISOString()
    };
    return { ...this.files[index] };
  }

  async delete(id) {
    await delay(300);
    const index = this.files.findIndex(f => f.id === id);
    if (index === -1) throw new Error('File not found');
    
    const file = this.files[index];
    this.files.splice(index, 1);
    
    // Move to trash
    this.trashedFiles.push({
      ...file,
      deletedDate: new Date().toISOString()
    });
    
    return true;
  }

  async deleteFile(id) {
    return this.delete(id);
  }

  async restoreFile(id) {
    await delay(300);
    const index = this.trashedFiles.findIndex(f => f.id === id);
    if (index === -1) throw new Error('File not found in trash');
    
    const file = this.trashedFiles[index];
    this.trashedFiles.splice(index, 1);
    
    // Remove deletedDate and add back to files
    const { deletedDate, ...restoredFile } = file;
    this.files.push(restoredFile);
    
    return true;
  }

  async permanentlyDeleteFile(id) {
    await delay(300);
    const index = this.trashedFiles.findIndex(f => f.id === id);
    if (index === -1) throw new Error('File not found in trash');
    
    this.trashedFiles.splice(index, 1);
    return true;
  }

  async emptyTrash() {
    await delay(500);
    this.trashedFiles = [];
    return true;
  }

  async downloadFile(id) {
    await delay(200);
    const file = this.files.find(f => f.id === id);
    if (!file) throw new Error('File not found');
    
    // Simulate download
    console.log(`Downloading file: ${file.name}`);
    return true;
  }

  async searchFiles(query) {
    await delay(300);
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    const results = this.files.filter(file => 
      file.name.toLowerCase().includes(searchTerm)
    );
    
    return [...results];
  }
}

export default new FileService();