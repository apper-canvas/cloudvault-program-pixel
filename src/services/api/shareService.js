import shareLinksData from '../mockData/shareLinks.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ShareService {
  constructor() {
    this.shareLinks = [...shareLinksData];
  }

  async getAll() {
    await delay(300);
    return [...this.shareLinks];
  }

  async getById(id) {
    await delay(200);
    const shareLink = this.shareLinks.find(s => s.id === id);
    if (!shareLink) throw new Error('Share link not found');
    return { ...shareLink };
  }

  async getSharedFiles() {
    await delay(300);
    // Return share links with file data
    const sharedFiles = this.shareLinks.map(shareLink => ({
      ...shareLink,
      file: {
        id: shareLink.fileId,
        name: shareLink.fileName || `File_${shareLink.fileId}`,
        size: Math.floor(Math.random() * 10000000), // Random size for demo
        type: this.getRandomFileType(),
        isFolder: false,
        thumbnailUrl: null
      }
    }));
    return [...sharedFiles];
  }

  async createShareLink(fileId, options = {}) {
    await delay(400);
    
    const shareLink = {
      id: Date.now().toString(),
      fileId: fileId,
      url: `https://cloudvault.app/s/${this.generateShareCode()}`,
      createdDate: new Date().toISOString(),
      expiryDate: options.expiryDate || null,
      password: options.password || null,
      fileName: options.fileName || `File_${fileId}`
    };
    
    this.shareLinks.push(shareLink);
    return { ...shareLink };
  }

  async updateShareLink(id, data) {
    await delay(300);
    const index = this.shareLinks.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Share link not found');
    
    this.shareLinks[index] = {
      ...this.shareLinks[index],
      ...data
    };
    return { ...this.shareLinks[index] };
  }

  async revokeShareLink(id) {
    await delay(300);
    const index = this.shareLinks.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Share link not found');
    
    this.shareLinks.splice(index, 1);
    return true;
  }

  async delete(id) {
    return this.revokeShareLink(id);
  }

  generateShareCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  getRandomFileType() {
    const types = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain', 'application/zip'];
    return types[Math.floor(Math.random() * types.length)];
  }
}

export default new ShareService();