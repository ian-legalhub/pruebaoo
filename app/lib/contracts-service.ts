import { files_api } from './api-config';
import { FileMetadata } from '../types/file';

export class ContractsService {
  static async generate_document(contractId: string): Promise<FileMetadata> {
    const response = await files_api.post(`/contracts/${contractId}/generate-doc`);
    return response.data;
  }
}


