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
      
      if (!trashedFile) {
        throw new Error('Trashed file not found');
      }
      
      // Create in main file table with only Updateable fields
      const restoredFileData = {
        Name: trashedFile.Name,
        Tags: trashedFile.Tags || '',
        size: trashedFile.size,
        type: trashedFile.type,
        upload_date: trashedFile.upload_date,
        modified_date: new Date().toISOString(),
        path: trashedFile.path,
        is_folder: trashedFile.is_folder,
        parent_id: trashedFile.parent_id,
        thumbnail_url: trashedFile.thumbnail_url,
        share_url: trashedFile.share_url
      };

      const createParams = {
        records: [restoredFileData]
      };

      const createResponse = await this.apperClient.createRecord('file', createParams);
      
      if (!createResponse.success) {
        console.error('Error restoring file:', createResponse.message);
        throw new Error(createResponse.message);
      }

      if (createResponse.results) {
        const failed = createResponse.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to restore file:`, failed);
          throw new Error('Failed to restore file');
        }
      }

      // Remove from trashed_file table
      const deleteParams = {
        RecordIds: [parseInt(id)]
      };

      const deleteResponse = await this.apperClient.deleteRecord('trashed_file', deleteParams);
      
      if (!deleteResponse.success) {
        console.error('Error removing from trash:', deleteResponse.message);
        throw new Error(deleteResponse.message);
      }

      if (deleteResponse.results) {
        const failed = deleteResponse.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to remove from trash:`, failed);
          throw new Error('Failed to remove from trash');
        }
      }

      return true;
    } catch (error) {
      console.error("Error restoring file:", error);
      throw error;
    }
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
          {"field": {"Name": "size"}},
          {"field": {"Name": "type"}},
          {"field": {"Name": "upload_date"}},
          {"field": {"Name": "modified_date"}},
          {"field": {"Name": "deleted_date"}},
          {"field": {"Name": "path"}},
          {"field": {"Name": "is_folder"}},
          {"field": {"Name": "parent_id"}},
          {"field": {"Name": "thumbnail_url"}},
          {"field": {"Name": "share_url"}}
        ],
        orderBy: [{"fieldName": "deleted_date", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };
      
      const response = await this.apperClient.fetchRecords('trashed_file', params);
      
      if (!response.success) {
        console.error('Error fetching trashed files:', response.message);
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
          {"field": {"Name": "size"}},
          {"field": {"Name": "type"}},
          {"field": {"Name": "upload_date"}},
          {"field": {"Name": "modified_date"}},
          {"field": {"Name": "deleted_date"}},
          {"field": {"Name": "path"}},
          {"field": {"Name": "is_folder"}},
          {"field": {"Name": "parent_id"}},
          {"field": {"Name": "thumbnail_url"}},
          {"field": {"Name": "share_url"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById('trashed_file', id, params);
      
      if (!response.success) {
        console.error(`Error fetching trashed file ${id}:`, response.message);
        throw new Error(response.message);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error in getById ${id}:`, error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async create(fileData) {
    try {
      // Only include Updateable fields
      const createData = {
        Name: fileData.Name || fileData.name,
        Tags: fileData.Tags || fileData.tags || '',
        size: fileData.size || 0,
        type: fileData.type || 'file',
        upload_date: fileData.upload_date || fileData.uploadDate || fileData.created_date,
        modified_date: fileData.modified_date || fileData.modifiedDate || new Date().toISOString(),
        deleted_date: fileData.deleted_date || new Date().toISOString(),
        path: fileData.path || '',
        is_folder: fileData.is_folder || fileData.isFolder || false,
        parent_id: fileData.parent_id || fileData.parentId || '',
        thumbnail_url: fileData.thumbnail_url || fileData.thumbnailUrl || '',
        share_url: fileData.share_url || fileData.shareUrl || ''
      };

      const params = {
        records: [createData]
      };

      const response = await this.apperClient.createRecord('trashed_file', params);
      
      if (!response.success) {
        console.error('Error creating trashed file:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create trashed file:`, failed);
          failed.forEach(record => {
            if (record.message) {
              throw new Error(record.message);
            }
          });
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error('Error in create:', error?.response?.data?.message || error.message);
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
        console.error('Error permanently deleting file:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to permanently delete file:`, failed);
          failed.forEach(record => {
            if (record.message) {
              throw new Error(record.message);
            }
          });
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error in permanentlyDeleteFile:', error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async emptyTrash() {
    try {
      const allTrashedFiles = await this.getAll();
      
      if (allTrashedFiles.length === 0) {
        return true;
      }

      const recordIds = allTrashedFiles.map(file => file.Id);
      const params = {
        RecordIds: recordIds
      };

      const response = await this.apperClient.deleteRecord('trashed_file', params);
      
      if (!response.success) {
        console.error('Error emptying trash:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to empty trash completely:`, failed);
          // Don't throw error for partial success - some files deleted
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error in emptyTrash:', error?.response?.data?.message || error.message);
      throw error;
    }
  }
}