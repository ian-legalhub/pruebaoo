import { files_api } from './api-config';
import {
  StartCollaborationDto,
  StartCollaborationResponse,
  CollaborationSession,
} from '../types/collaboration';

export class CollaborationService {
  static async start_collaboration(
    dto: StartCollaborationDto
  ): Promise<StartCollaborationResponse> {
    const response = await files_api.post<StartCollaborationResponse>(
      '/collaboration/start',
      dto
    );
    return response.data;
  }

  static async get_active_sessions(
    fileId: string
  ): Promise<CollaborationSession[]> {
    const response = await files_api.get<{ sessions: CollaborationSession[] }>(
      `/collaboration/sessions/${fileId}`
    );
    return response.data.sessions;
  }

  static async update_session_activity(sessionId: string): Promise<void> {
    try {
      await files_api.post(`/collaboration/sessions/${sessionId}/activity`, {});
    } catch (error) {
      // No lanzar error para no interrumpir la edición
    }
  }

  static async end_collaboration(sessionId: string): Promise<void> {
    try {
      await files_api.delete(`/collaboration/sessions/${sessionId}`);
    } catch (error) {
      // No lanzar error para no interrumpir el cierre
    }
  }

  static async get_user_sessions(
    userId: string
  ): Promise<CollaborationSession[]> {
    const response = await files_api.get<{ sessions: CollaborationSession[] }>(
      `/collaboration/user/${userId}/sessions`
    );
    return response.data.sessions;
  }
}

