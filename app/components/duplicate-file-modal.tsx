'use client';

import { useState } from 'react';
import { X, Copy, Loader2 } from 'lucide-react';

interface DuplicateFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  fileName: string;
  onDuplicate: (fileId: string, options?: { suffix?: string; newName?: string }) => Promise<void>;
}

export function DuplicateFileModal({
  isOpen,
  onClose,
  fileId,
  fileName,
  onDuplicate
}: DuplicateFileModalProps) {
  const [useCustomName, setUseCustomName] = useState(false);
  const [suffix, setSuffix] = useState('');
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handle_duplicate = async () => {
    setError('');
    setIsLoading(true);

    try {
      const options = useCustomName 
        ? { newName: newName.trim() } 
        : suffix.trim() 
          ? { suffix: suffix.trim() } 
          : {};

      await onDuplicate(fileId, options);
      onClose();
      reset_form();
    } catch (err: any) {
      console.error('Error al duplicar archivo:', err);
      setError(err.message || 'Error al duplicar el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  const reset_form = () => {
    setUseCustomName(false);
    setSuffix('');
    setNewName('');
    setError('');
  };

  const handle_close = () => {
    if (!isLoading) {
      reset_form();
      onClose();
    }
  };

  const get_preview_name = (): string => {
    if (useCustomName && newName.trim()) {
      return newName.trim();
    }
    
    if (!useCustomName && suffix.trim()) {
      const parts = fileName.split('.');
      const extension = parts.length > 1 ? parts.pop() : '';
      const baseName = parts.join('.');
      return `${baseName}_${suffix.trim()}${extension ? '.' + extension : ''}`;
    }
    
    return `${fileName} (copia)`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#540c97' }}>
              <Copy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Duplicar Archivo
              </h2>
              <p className="text-sm text-zinc-500 mt-1">{fileName}</p>
            </div>
          </div>
          <button
            onClick={handle_close}
            disabled={isLoading}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-zinc-300 dark:hover:border-zinc-600"
              style={!useCustomName ? { borderColor: '#540c97', backgroundColor: 'rgba(84, 12, 151, 0.05)' } : { borderColor: '#e5e7eb' }}
            >
              <input
                type="radio"
                checked={!useCustomName}
                onChange={() => setUseCustomName(false)}
                className="mt-0.5 w-4 h-4"
                style={{ accentColor: '#540c97' }}
                disabled={isLoading}
              />
              <div className="flex-1">
                <div className="font-medium text-zinc-900 dark:text-white mb-1">
                  Agregar sufijo al nombre
                </div>
                <input
                  type="text"
                  placeholder="ej: v2, Cliente_A, Revision"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  disabled={useCustomName || isLoading}
                  className="w-full mt-2 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  El nombre original se mantendrá con un sufijo agregado
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-zinc-300 dark:hover:border-zinc-600"
              style={useCustomName ? { borderColor: '#540c97', backgroundColor: 'rgba(84, 12, 151, 0.05)' } : { borderColor: '#e5e7eb' }}
            >
              <input
                type="radio"
                checked={useCustomName}
                onChange={() => setUseCustomName(true)}
                className="mt-0.5 w-4 h-4"
                style={{ accentColor: '#540c97' }}
                disabled={isLoading}
              />
              <div className="flex-1">
                <div className="font-medium text-zinc-900 dark:text-white mb-1">
                  Nombre completo nuevo
                </div>
                <input
                  type="text"
                  placeholder="NuevoNombre.docx"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  disabled={!useCustomName || isLoading}
                  className="w-full mt-2 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Especifica un nombre completamente nuevo para la copia
                </p>
              </div>
            </label>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: '#f5f9f9' }}>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
              Vista previa del nombre:
            </p>
            <p className="font-medium text-zinc-900 dark:text-white">
              {get_preview_name()}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-700">
          <button
            onClick={handle_close}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handle_duplicate}
            disabled={isLoading}
            className="flex-1 px-4 py-3 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: '#540c97' }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#6b0ec4')}
            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#540c97')}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Duplicando...
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Duplicar Archivo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


