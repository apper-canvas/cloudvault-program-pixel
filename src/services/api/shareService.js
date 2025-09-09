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

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "Owner"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "ModifiedBy"}},
          {"field": {"Name": "file_id"}},
          {"field": {"Name": "file_name"}},
          {"field": {"Name": "url"}},
          {"field": {"Name": "created_date"}},
          {"field": {"Name": "expiry_date"}},
          {"field": {"Name": "password"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };
      
      const response = await this.apperClient.fetchRecords('share_link', params);
      
      if (!response.success) {
        console.error('Error fetching share links:', response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error in getAll:', error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "Owner"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "ModifiedBy"}},
          {"field": {"Name": "file_id"}},
          {"field": {"Name": "file_name"}},
          {"field": {"Name": "url"}},
          {"field": {"Name": "created_date"}},
          {"field": {"Name": "expiry_date"}},
          {"field": {"Name": "password"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById('share_link', id, params);
      
      if (!response.success) {
        console.error(`Error fetching share link ${id}:`, response.message);
        throw new Error(response.message);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error in getById ${id}:`, error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getSharedFiles() {
    try {
      const result = await this.getAll();
      return result;
    } catch (error) {
      console.error('Error in getSharedFiles:', error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async createShareLink(fileId, options = {}) {
    try {
      const shareCode = this.generateShareCode();
      const shareUrl = `${window.location.origin}/share/${shareCode}`;
      
      // Only include Updateable fields
      const shareData = {
        Name: options.name || `Share-${shareCode}`,
        Tags: options.tags || '',
        file_id: fileId.toString(),
        file_name: options.fileName || options.file_name || '',
        url: shareUrl,
        created_date: new Date().toISOString(),
        expiry_date: options.expiryDate || options.expiry_date || null,
        password: options.password || ''
      };

      const params = {
        records: [shareData]
      };

      const response = await this.apperClient.createRecord('share_link', params);
      
      if (!response.success) {
        console.error('Error creating share link:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create share link:`, failed);
          failed.forEach(record => {
            if (record.message) {
              throw new Error(record.message);
            }
          });
        }
        
        const createdRecord = successful.length > 0 ? successful[0].data : null;
        return {
          ...createdRecord,
          shareCode,
          shareUrl
        };
      }
    } catch (error) {
      console.error('Error in createShareLink:', error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async updateShareLink(id, data) {
    try {
      // Only include Updateable fields
      const updateData = {
        Id: parseInt(id),
        Name: data.Name || data.name,
        Tags: data.Tags || data.tags,
        file_id: data.file_id || data.fileId,
        file_name: data.file_name || data.fileName,
        url: data.url,
        expiry_date: data.expiry_date || data.expiryDate,
        password: data.password
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const params = {
        records: [updateData]
      };

      const response = await this.apperClient.updateRecord('share_link', params);
      
      if (!response.success) {
        console.error('Error updating share link:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update share link:`, failed);
          failed.forEach(record => {
            if (record.message) {
              throw new Error(record.message);
            }
          });
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error('Error in updateShareLink:', error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async revokeShareLink(id) {
    try {
      return await this.delete(id);
    } catch (error) {
      console.error('Error in revokeShareLink:', error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('share_link', params);
      
      if (!response.success) {
        console.error('Error deleting share link:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete share link:`, failed);
          failed.forEach(record => {
            if (record.message) {
              throw new Error(record.message);
            }
          });
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error in delete:', error?.response?.data?.message || error.message);
      throw error;
    }
  }

}