'use client';

import { useState } from 'react';
import { FileMetadata } from '../types/file';
import { FileService } from '../lib/file-service';
import { 
  File, 
  Download, 
  Trash2, 
  Edit, 
  History, 
  Copy,
  MoreVertical,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Presentation,
  Loader2
} from 'lucide-react';

interface FileListProps {
  files: FileMetadata[];
  onRefresh: () => void;
  onEditFile: (fileId: string) => void;
  onViewVersions: (fileId: string, fileName: string) => void;
  onDuplicate: (fileId: string, fileName: string) => void;
}

export function FileList({ files, onRefresh, onEditFile, onViewVersions, onDuplicate }: FileListProps) {
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const get_file_icon = (mimeType: string) => {
    if (mimeType.includes('word') || mimeType.includes('document')) {
      return <FileText className="w-6 h-6 text-blue-500" />;
    }
    if (mimeType.includes('sheet') || mimeType.includes('excel')) {
      return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
    }
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return <Presentation className="w-6 h-6 text-orange-500" />;
    }
    if (mimeType.includes('image')) {
      return <ImageIcon className="w-6 h-6 text-purple-500" />;
    }
    return <File className="w-6 h-6 text-zinc-400" />;
  };

  const format_file_size = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const format_date = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handle_download = async (file: FileMetadata) => {
    setLoadingAction(`download-${file.id}`);
    try {
      await FileService.download_file(file.id, file.fileName);
    } catch (error) {
      console.error('Error al descargar:', error);
      alert('Error al descargar el archivo');
    } finally {
      setLoadingAction(null);
    }
  };

  const handle_delete = async (file: FileMetadata) => {
    if (!confirm(`¿Estás seguro de eliminar "${file.fileName}"?`)) {
      return;
    }

    setLoadingAction(`delete-${file.id}`);
    try {
      await FileService.delete_file(file.id);
      onRefresh();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar el archivo');
    } finally {
      setLoadingAction(null);
    }
  };

  const handle_edit = (fileId: string) => {
    onEditFile(fileId);
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-16">
        <File className="w-16 h-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
        <p className="text-zinc-500 dark:text-zinc-400 text-lg">
          No hay archivos todavía
        </p>
        <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-2">
          Sube tu primer archivo para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {files.map((file) => (
        <div
          key={file.id}
          onMouseEnter={() => setHoveredFile(file.id)}
          onMouseLeave={() => setHoveredFile(null)}
          className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 hover:shadow-lg hover:border-yellow-500 dark:hover:border-yellow-500 transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
              {get_file_icon(file.mimeType)}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                {file.fileName}
              </h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-zinc-500">
                <span>{format_file_size(file.fileSize)}</span>
                <span>v{file.version}</span>
                <span>{file.uploadedByName}</span>
                <span>{format_date(file.updatedAt)}</span>
              </div>
            </div>

            <div className={`flex items-center gap-2 transition-all duration-200 ${
              hoveredFile === file.id ? 'opacity-100' : 'opacity-0'
            }`}>
              <button
                onClick={() => handle_edit(file.id)}
                disabled={loadingAction !== null}
                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit className="w-5 h-5" />
              </button>

              <button
                onClick={() => handle_download(file)}
                disabled={loadingAction !== null}
                className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                title="Descargar"
              >
                {loadingAction === `download-${file.id}` ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => onViewVersions(file.id, file.fileName)}
                disabled={loadingAction !== null}
                className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                style={{ color: '#540c97' }}
                title="Ver versiones"
              >
                <History className="w-5 h-5" />
              </button>

              <button
                onClick={() => onDuplicate(file.id, file.fileName)}
                disabled={loadingAction !== null}
                className="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg transition-colors"
                title="Duplicar"
              >
                <Copy className="w-5 h-5" />
              </button>

              <button
                onClick={() => handle_delete(file)}
                disabled={loadingAction !== null}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                title="Eliminar"
              >
                {loadingAction === `delete-${file.id}` ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

