'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { X, Upload, File, Loader2 } from 'lucide-react';
import { FileService } from '../lib/file-service';

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadFileModal({ isOpen, onClose, onSuccess }: UploadFileModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handle_file_select = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError('El archivo no debe superar los 50MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handle_upload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError('');

    try {
      await FileService.upload_file(selectedFile);
      onSuccess();
      handle_close();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handle_close = () => {
    setSelectedFile(null);
    setError('');
    onClose();
  };

  const format_file_size = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Subir Archivo
          </h2>
          <button
            onClick={handle_close}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            disabled={isUploading}
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl p-12 text-center cursor-pointer hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-all"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
              <p className="text-zinc-700 dark:text-zinc-300 font-medium mb-2">
                Haz clic para seleccionar un archivo
              </p>
              <p className="text-sm text-zinc-500">
                Tamaño máximo: 50MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handle_file_select}
                className="hidden"
              />
            </div>
          ) : (
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-500 rounded-lg">
                  <File className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-900 dark:text-white truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">
                    {format_file_size(selectedFile.size)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-700">
          <button
            onClick={handle_close}
            className="flex-1 px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            disabled={isUploading}
          >
            Cancelar
          </button>
          <button
            onClick={handle_upload}
            disabled={!selectedFile || isUploading}
            className="flex-1 px-4 py-3 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: '#540c97' }}
            onMouseEnter={(e) => (!selectedFile || isUploading) || (e.currentTarget.style.backgroundColor = '#6b0ec4')}
            onMouseLeave={(e) => (!selectedFile || isUploading) || (e.currentTarget.style.backgroundColor = '#540c97')}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Subiendo...
              </>
            ) : (
              'Subir Archivo'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

