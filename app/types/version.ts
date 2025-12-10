export interface FileVersion {
  id: string;
  version: number;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
  changes?: string;
}

export interface FileVersionHistory {
  fileId: string;
  fileName: string;
  currentVersion: number;
  versions: FileVersion[];
}


