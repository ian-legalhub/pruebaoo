export interface FileMetadata {
  id: string;
  fileName: string;
  originalName: string;
  filePath?: string;
  fileSize: number;
  mimeType: string;
  fileExtension: string;
  version: number;
  uploadedBy: string;
  uploadedByName: string;
  isContract?: boolean;
  contractId?: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FileListResponse {
  files: FileMetadata[];
}

export interface UploadFileMetadata {
  isContract?: boolean;
  contractId?: string;
  isPublic?: boolean;
}

export interface OnlyOfficeConfig {
  success: boolean;
  config: {
    document: {
      fileType: string;
      key: string;
      title: string;
      url: string;
      permissions: {
        edit: boolean;
        download: boolean;
        comment: boolean;
        fillForms: boolean;
        review: boolean;
      };
      compareFile?: {
        fileType: string;
        url: string;
      };
    };
    documentType: string;
    editorConfig: {
      lang: string;
      mode: string;
      callbackUrl?: string;
      user: {
        id: string;
        name: string;
      };
      customization: {
        autosave: boolean;
        chat: boolean;
        comments: boolean;
        help: boolean;
        hideRightMenu: boolean;
        hideFileMenu: boolean;
        logo: string;
      };
    };
    token: string;
  };
  editorApiUrl: string;
  sessionId?: string;
  fileInfo: {
    id: string;
    fileName: string;
    uploadedBy: string;
    createdAt: string;
    version: number;
    originalVersion?: number;
    revisedVersion?: number;
    originalModifiedBy?: string;
    originalModifiedAt?: string;
    revisedModifiedBy?: string;
    revisedModifiedAt?: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  isComparison?: boolean;
  readOnly?: boolean;
  isHistoricalVersion?: boolean;
}


