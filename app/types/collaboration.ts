export interface StartCollaborationDto {
  fileId: string;
  userId?: string;
  userName?: string;
  permissions?: {
    edit?: boolean;
    download?: boolean;
    comment?: boolean;
    fillForms?: boolean;
    review?: boolean;
  };
}

export interface CollaborationSession {
  id: string;
  fileId: string;
  userId: string;
  userName: string;
  startedAt: string;
  lastActivity: string;
  permissions: {
    edit: boolean;
    download: boolean;
    comment: boolean;
    fillForms: boolean;
    review: boolean;
  };
}

export interface StartCollaborationResponse {
  sessionId: string;
  session: CollaborationSession;
}

export interface UpdateSessionActivityDto {
  lastActivity?: string;
}

