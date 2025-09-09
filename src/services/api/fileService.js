const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class FileService {
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
          { field: { Name: "size" } },
          { field: { Name: "type" } },
          { field: { Name: "upload_date" } },
          { field: { Name: "modified_date" } },
          { field: { Name: "path" } },
          { field: { Name: "is_folder" } },
          { field: { Name: "parent_id" } },
          { field: { Name: "thumbnail_url" } },
          { field: { Name: "share_url" } }
        ]
      };

      const response = await this.apperClient.fetchRecords('file', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
} catch (error) {
      console.error("Error fetching files:", error);
      throw error;
    }
  }

  async getById(id) {
try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "size" } },
          { field: { Name: "type" } },
          { field: { Name: "upload_date" } },
          { field: { Name: "modified_date" } },
          { field: { Name: "path" } },
          { field: { Name: "is_folder" } },
          { field: { Name: "parent_id" } },
          { field: { Name: "thumbnail_url" } },
          { field: { Name: "share_url" } }
        ]
      };

      const response = await this.apperClient.getRecordById('file', parseInt(id), params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching file with ID ${id}:`, error);
      throw error;
    }
  }

  async getFilesByPath(path = '') {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "size" } },
          { field: { Name: "type" } },
          { field: { Name: "upload_date" } },
          { field: { Name: "modified_date" } },
          { field: { Name: "path" } },
          { field: { Name: "is_folder" } },
          { field: { Name: "parent_id" } },
          { field: { Name: "thumbnail_url" } },
          { field: { Name: "share_url" } }
        ],
        where: [
          {
            FieldName: "path",
            Operator: "EqualTo",
            Values: [path]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords('file', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching files by path:", error);
      throw error;
    }
  }

  async getRecentFiles() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "size" } },
          { field: { Name: "type" } },
          { field: { Name: "upload_date" } },
          { field: { Name: "modified_date" } },
          { field: { Name: "path" } },
          { field: { Name: "is_folder" } },
          { field: { Name: "parent_id" } },
          { field: { Name: "thumbnail_url" } },
          { field: { Name: "share_url" } }
        ],
        where: [
          {
            FieldName: "modified_date",
            Operator: "GreaterThan",
            Values: [thirtyDaysAgo.toISOString()]
          }
        ],
        orderBy: [
          {
            fieldName: "modified_date",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: 20,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('file', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching recent files:", error);
      throw error;
    }
  }
// Get accessible files (files tagged as accessible/favorites)
  async getAccessibleFiles() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "size"}},
          {"field": {"Name": "type"}},
          {"field": {"Name": "upload_date"}},
          {"field": {"Name": "modified_date"}},
          {"field": {"Name": "path"}},
          {"field": {"Name": "is_folder"}},
          {"field": {"Name": "parent_id"}},
          {"field": {"Name": "thumbnail_url"}},
          {"field": {"Name": "share_url"}}
        ],
        where: [
          {"FieldName": "Tags", "Operator": "Contains", "Values": ["accessible"], "Include": true}
        ],
        orderBy: [{"fieldName": "modified_date", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords('file', params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching accessible files:', error?.response?.data?.message || error);
      throw error;
    }
  }
async create(fileData) {
    try {
      const params = {
        records: [
          {
            Name: fileData.name,
            size: fileData.size,
            type: fileData.type,
            upload_date: fileData.uploadDate || new Date().toISOString(),
            modified_date: fileData.modifiedDate || new Date().toISOString(),
            path: fileData.path || "",
            is_folder: fileData.isFolder || false,
            parent_id: fileData.parentId || "",
            thumbnail_url: fileData.thumbnailUrl || "",
            share_url: fileData.shareUrl || ""
          }
        ]
      };

      const response = await this.apperClient.createRecord('file', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to create file');
        }

        return successfulRecords[0]?.data;
      }
    } catch (error) {
      console.error("Error creating file:", error);
      throw error;
    }
  }
async update(id, data) {
    try {
      const updateData = {
        Id: parseInt(id)
      };

      // Only include updateable fields
      if (data.name !== undefined) updateData.Name = data.name;
      if (data.size !== undefined) updateData.size = data.size;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.modified_date !== undefined) updateData.modified_date = data.modified_date;
      if (data.path !== undefined) updateData.path = data.path;
      if (data.is_folder !== undefined) updateData.is_folder = data.is_folder;
      if (data.parent_id !== undefined) updateData.parent_id = data.parent_id;
      if (data.thumbnail_url !== undefined) updateData.thumbnail_url = data.thumbnail_url;
      if (data.share_url !== undefined) updateData.share_url = data.share_url;

      const params = {
        records: [updateData]
      };

      const response = await this.apperClient.updateRecord('file', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);

        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          throw new Error('Failed to update file');
        }

        return successfulUpdates[0]?.data;
      }
    } catch (error) {
      console.error("Error updating file:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      // Get the file first to create trashed file record
      const file = await this.getById(id);
      if (!file) {
        throw new Error('File not found');
      }

      // Create trashed file record with only Updateable fields
      const trashedFileData = {
        Name: file.Name,
        Tags: file.Tags,
        size: file.size,
        type: file.type,
        upload_date: file.upload_date,
        modified_date: file.modified_date,
        deleted_date: new Date().toISOString(),
        path: file.path,
        is_folder: file.is_folder,
        parent_id: file.parent_id,
        thumbnail_url: file.thumbnail_url,
        share_url: file.share_url
      };

      const createTrashedParams = {
        records: [trashedFileData]
      };

      const trashedResponse = await this.apperClient.createRecord('trashed_file', createTrashedParams);
      
      if (!trashedResponse.success) {
        console.error('Error creating trashed file:', trashedResponse.message);
        throw new Error(trashedResponse.message);
      }

      if (trashedResponse.results) {
        const failed = trashedResponse.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create trashed file record:`, failed);
          throw new Error('Failed to create trashed file record');
        }
      }

      // Delete from main file table
      const deleteParams = {
        RecordIds: [parseInt(id)]
      };

      const deleteResponse = await this.apperClient.deleteRecord('file', deleteParams);
      
      if (!deleteResponse.success) {
        console.error('Error deleting file:', deleteResponse.message);
        throw new Error(deleteResponse.message);
      }

      if (deleteResponse.results) {
        const failed = deleteResponse.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete file:`, failed);
          throw new Error('Failed to delete file');
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  async deleteFile(id) {
    return this.delete(id);
  }

  async createTrashedFile(fileData) {
    try {
      const trashedFileService = new (await import('./trashedFileService.js')).default;
      return await trashedFileService.create(fileData);
    } catch (error) {
      console.error("Error creating trashed file:", error);
      throw error;
    }
  }

  async downloadFile(id) {
    await delay(200);
    const file = await this.getById(id);
    if (!file) throw new Error('File not found');
    
    // Simulate download
    console.log(`Downloading file: ${file.Name}`);
    return true;
  }

  async searchFiles(query) {
    try {
      if (!query.trim()) return [];

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "size" } },
          { field: { Name: "type" } },
          { field: { Name: "upload_date" } },
          { field: { Name: "modified_date" } },
          { field: { Name: "path" } },
          { field: { Name: "is_folder" } },
          { field: { Name: "parent_id" } },
          { field: { Name: "thumbnail_url" } },
          { field: { Name: "share_url" } }
        ],
        where: [
          {
            FieldName: "Name",
            Operator: "Contains",
            Values: [query]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords('file', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
console.error("Error searching files:", error);
      throw error;
    }
  }
}

export default new FileService();