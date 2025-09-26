const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ShareService {
  constructor() {
    // Initialize ApperClient
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "file_id" } },
          { field: { Name: "file_name" } },
          { field: { Name: "url" } },
          { field: { Name: "created_date" } },
          { field: { Name: "expiry_date" } },
          { field: { Name: "password" } }
        ]
      };

      const response = await this.apperClient.fetchRecords('share_link', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching share links:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "file_id" } },
          { field: { Name: "file_name" } },
          { field: { Name: "url" } },
          { field: { Name: "created_date" } },
          { field: { Name: "expiry_date" } },
          { field: { Name: "password" } }
        ]
      };

      const response = await this.apperClient.getRecordById('share_link', parseInt(id), params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching share link with ID ${id}:`, error);
      throw error;
    }
  }

  async getSharedFiles() {
    try {
      const shareLinks = await this.getAll();
      
      // Map share links to include file information
      const sharedFiles = shareLinks.map(shareLink => ({
        ...shareLink,
        id: shareLink.Id,
        fileId: shareLink.file_id,
        fileName: shareLink.file_name,
        url: shareLink.url,
        createdDate: shareLink.created_date,
        expiryDate: shareLink.expiry_date,
        password: shareLink.password,
        file: {
          id: shareLink.file_id,
          name: shareLink.file_name || `File_${shareLink.file_id}`,
          size: Math.floor(Math.random() * 10000000), // Random size for demo
          type: this.getRandomFileType(),
          isFolder: false,
          thumbnailUrl: null
        }
      }));

      return sharedFiles;
    } catch (error) {
      console.error("Error fetching shared files:", error);
      throw error;
    }
  }

  async createShareLink(fileId, options = {}) {
    try {
      const params = {
        records: [
          {
            Name: options.name || `Share_${fileId}`,
            file_id: fileId.toString(),
            file_name: options.fileName || `File_${fileId}`,
            url: `https://cloudvault.app/s/${this.generateShareCode()}`,
            created_date: new Date().toISOString(),
            expiry_date: options.expiryDate || null,
            password: options.password || null
          }
        ]
      };

      const response = await this.apperClient.createRecord('share_link', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to create share link');
        }

        const createdRecord = successfulRecords[0]?.data;
        return {
          id: createdRecord.Id,
          fileId: createdRecord.file_id,
          fileName: createdRecord.file_name,
          url: createdRecord.url,
          createdDate: createdRecord.created_date,
          expiryDate: createdRecord.expiry_date,
          password: createdRecord.password
        };
      }
    } catch (error) {
      console.error("Error creating share link:", error);
      throw error;
    }
  }

  async updateShareLink(id, data) {
    try {
      const updateData = {
        Id: parseInt(id)
      };

      // Only include updateable fields
      if (data.name !== undefined) updateData.Name = data.name;
      if (data.file_id !== undefined) updateData.file_id = data.file_id;
      if (data.file_name !== undefined) updateData.file_name = data.file_name;
      if (data.url !== undefined) updateData.url = data.url;
      if (data.created_date !== undefined) updateData.created_date = data.created_date;
      if (data.expiry_date !== undefined) updateData.expiry_date = data.expiry_date;
      if (data.password !== undefined) updateData.password = data.password;

      const params = {
        records: [updateData]
      };

      const response = await this.apperClient.updateRecord('share_link', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);

        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          throw new Error('Failed to update share link');
        }

        return successfulUpdates[0]?.data;
      }
    } catch (error) {
      console.error("Error updating share link:", error);
      throw error;
    }
  }

  async revokeShareLink(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('share_link', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error revoking share link:", error);
      throw error;
    }
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

// Export instance as default
export default new ShareService();