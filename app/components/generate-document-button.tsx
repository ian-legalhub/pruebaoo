'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileService } from '../lib/file-service';
import { ContractsService } from '../lib/contracts-service';
import { FileText, Loader2 } from 'lucide-react';

interface GenerateDocumentButtonProps {
  contractId: string;
  className?: string;
}

export function GenerateDocumentButton({ contractId, className }: GenerateDocumentButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle_generate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const file = await ContractsService.generate_document(contractId);

      // Abrimos el documento generado en OnlyOffice reutilizando la ruta de editor existente
      // (el backend debe exponer GET /onlyoffice/open-file/:fileId, ya manejado por FileService.open_in_editor).
      await FileService.open_in_editor(file.id, 'edit');
      router.push(`/editor/${file.id}?mode=edit`);
    } catch (err: any) {
      console.error('Error al generar documento de contrato:', err);
      setError(
        err?.message ||
          'Error al generar el documento. Verifica el endpoint /contracts/:contractId/generate-doc.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handle_generate}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#540c97' }}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            Generar documento
          </>
        )}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}


