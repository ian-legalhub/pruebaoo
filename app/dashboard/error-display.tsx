'use client';

import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  message: string;
  details?: string;
}

export function ErrorDisplay({ message, details }: ErrorDisplayProps) {
  return (
    <div className="p-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
        {message}
      </h3>
      {details && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          {details}
        </p>
      )}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-left max-w-2xl mx-auto">
        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
          Verifica tu configuración:
        </p>
        <ol className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 list-decimal list-inside">
          <li>Revisa que el archivo <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">.env.local</code> existe</li>
          <li>Verifica que <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">NEXT_PUBLIC_API_URL</code> esté configurado</li>
          <li>Asegúrate de que el backend esté corriendo en esa URL</li>
          <li>Verifica que el tenant-id esté configurado</li>
          <li>Abre la consola del navegador (F12) para ver más detalles</li>
        </ol>
      </div>
    </div>
  );
}


