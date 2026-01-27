import { FileListResponse, FileMetadata, UploadFileMetadata, OnlyOfficeConfig } from '../types/file';
import { files_api } from './api-config';

export class FileService {
  static async upload_file(file: File, metadata?: UploadFileMetadata): Promise<FileMetadata> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata?.isTemplate !== undefined) {
      formData.append('isTemplate', String(metadata.isTemplate));
    }
    if (metadata?.isContract) {
      formData.append('isContract', String(metadata.isContract));
    }
    if (metadata?.contractId) {
      formData.append('contractId', metadata.contractId);
    }
    if (metadata?.isPublic !== undefined) {
      formData.append('isPublic', String(metadata.isPublic));
    }

    const response = await files_api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  static async create_blank_file(payload: {
    fileName: string;
    isTemplate?: boolean;
    isContract?: boolean;
    contractId?: string;
    isPublic?: boolean;
  }): Promise<FileMetadata> {
    const response = await files_api.post('/files/create-blank', payload);
    return response.data;
  }

  static async list_files(filters?: {
    isContract?: string;
    contractId?: string;
    isPublic?: string;
  }): Promise<FileListResponse> {
    const response = await files_api.get('/files', { params: filters });
    return response.data;
  }

  static async get_file_metadata(fileId: string): Promise<FileMetadata> {
    const response = await files_api.get(`/files/${fileId}`);
    return response.data;
  }

  static async download_file(fileId: string, fileName: string): Promise<void> {
    const response = await files_api.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  static async delete_file(fileId: string): Promise<void> {
    await files_api.delete(`/files/${fileId}`);
  }

  static async duplicate_file(
    fileId: string, 
    options?: { suffix?: string; newName?: string }
  ): Promise<FileMetadata> {
    const response = await files_api.post(`/files/${fileId}/duplicate`, options || {});
    return response.data;
  }

  static async get_signed_url(fileId: string): Promise<string> {
    const response = await files_api.get(`/files/${fileId}/signed-url`);
    return response.data.url;
  }

  static async open_in_editor(fileId: string, mode: 'review' | 'view' = 'review'): Promise<OnlyOfficeConfig> {
    const response = await files_api.get(`/onlyoffice/open-file/${fileId}`, {
      params: { mode }
    });
    return response.data;
  }

  static async open_version_in_editor(fileId: string, version: number): Promise<OnlyOfficeConfig> {
    const response = await files_api.get(`/onlyoffice/open-file/${fileId}/version/${version}`);
    return response.data;
  }

  static async get_file_history(fileId: string): Promise<any> {
    const response = await files_api.get(`/files/${fileId}/history`);
    return response.data;
  }

  static async compare_versions(fileId: string, originalVersion: string | number, revisedVersion: string | number): Promise<OnlyOfficeConfig> {
    const originalVersionNum = typeof originalVersion === 'string' ? parseInt(originalVersion, 10) : originalVersion;
    const revisedVersionNum = typeof revisedVersion === 'string' ? parseInt(revisedVersion, 10) : revisedVersion;
    
    const response = await files_api.get(`/onlyoffice/compare/${fileId}/${originalVersionNum}/${revisedVersionNum}`);
    
    return response.data;
  }
}
