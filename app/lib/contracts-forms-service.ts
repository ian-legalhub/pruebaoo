import { files_api } from './api-config';
import { ContractsForm, ContractsFormListItem } from '../types/contracts';

export class ContractsFormsService {
  static async list_forms(): Promise<ContractsFormListItem[]> {
    const response = await files_api.get('/contracts-forms', {
      params: { limit: 0 },
    });

    const data = response.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray((data as any).items)) {
      return (data as any).items;
    }

    if (Array.isArray((data as any).data)) {
      return (data as any).data;
    }

    if (Array.isArray((data as any).results)) {
      return (data as any).results;
    }

    console.warn('Formato inesperado de respuesta en /contracts-forms:', data);
    return [];
  }

  static async get_form(contractsFormId: number | string): Promise<ContractsForm> {
    const response = await files_api.get(`/contracts-forms/${contractsFormId}`);
    return response.data;
  }

  static async set_template(
    contractsFormId: number | string,
    fileId: string | null,
  ): Promise<ContractsForm> {
    // Endpoint genérico para asociar la plantilla al formulario.
    // Si en el backend se usa otra ruta (por ejemplo, /contracts-forms/:id/template),
    // ajustar aquí únicamente esta llamada.
    const response = await files_api.patch(`/contracts-forms/${contractsFormId}`, {
      fileId,
    });
    return response.data;
  }
}


