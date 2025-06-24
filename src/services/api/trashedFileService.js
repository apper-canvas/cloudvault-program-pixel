const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class TrashedFileService {
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
          { field: { Name: "deleted_date" } },
          { field: { Name: "path" } },
          { field: { Name: "is_folder" } },
          { field: { Name: "parent_id" } },
          { field: { Name: "thumbnail_url" } },
          { field: { Name: "share_url" } }
        ]
      };

      const response = await this.apperClient.fetchRecords('trashed_file', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching trashed files:", error);
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
          { field: { Name: "deleted_date" } },
          { field: { Name: "path" } },
          { field: { Name: "is_folder" } },
          { field: { Name: "parent_id" } },
          { field: { Name: "thumbnail_url" } },
          { field: { Name: "share_url" } }
        ]
      };

      const response = await this.apperClient.getRecordById('trashed_file', parseInt(id), params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching trashed file with ID ${id}:`, error);
      throw error;
    }
  }

  async create(fileData) {
    try {
      const params = {
        records: [
          {
            Name: fileData.Name || fileData.name,
            size: fileData.size,
            type: fileData.type,
            upload_date: fileData.upload_date || fileData.uploadDate,
            modified_date: fileData.modified_date || fileData.modifiedDate,
            deleted_date: fileData.deleted_date || new Date().toISOString(),
            path: fileData.path || "",
            is_folder: fileData.is_folder || fileData.isFolder || false,
            parent_id: fileData.parent_id || fileData.parentId || "",
            thumbnail_url: fileData.thumbnail_url || fileData.thumbnailUrl || "",
            share_url: fileData.share_url || fileData.shareUrl || ""
          }
        ]
      };

      const response = await this.apperClient.createRecord('trashed_file', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to create trashed file');
        }

        return successfulRecords[0]?.data;
      }
    } catch (error) {
      console.error("Error creating trashed file:", error);
      throw error;
    }
  }

  async restoreFile(id) {
    try {
      // Get the trashed file
      const trashedFile = await this.getById(id);
      
      // Create file record (restore to files table)
      const fileService = new (await import('./fileService.js')).default;
      const { deleted_date, ...restoredFileData } = trashedFile;
      await fileService.create(restoredFileData);

      // Delete from trashed_file table
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('trashed_file', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error restoring file:", error);
      throw error;
    }
  }

  async permanentlyDeleteFile(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('trashed_file', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error permanently deleting file:", error);
      throw error;
    }
  }

  async emptyTrash() {
    try {
      // Get all trashed files
      const trashedFiles = await this.getAll();
      
      if (trashedFiles.length === 0) {
        return true;
      }

      const recordIds = trashedFiles.map(file => file.Id);
      
      const params = {
        RecordIds: recordIds
      };

      const response = await this.apperClient.deleteRecord('trashed_file', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error emptying trash:", error);
      throw error;
    }
  }
}

export default new TrashedFileService();