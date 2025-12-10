'use client';

import { useState, useEffect } from 'react';
import { X, Clock, User, Download, Eye, GitCompare, Loader2 } from 'lucide-react';
import { FileService } from '../lib/file-service';
import { FileVersion } from '../types/version';

interface FileVersionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  fileName: string;
  onViewVersion: (versionId: string, version: number) => void;
  onCompareVersions: (v1: string, v2: string) => void;
}

export function FileVersionsModal({ 
  isOpen, 
  onClose, 
  fileId, 
  fileName,
  onViewVersion,
  onCompareVersions 
}: FileVersionsModalProps) {
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      load_versions();
      setSelectedVersions([]);
    }
  }, [isOpen, fileId]);

  const load_versions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await FileService.get_file_history(fileId);
      const versionsList = response.versions || response.history || [];
      setVersions(versionsList);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las versiones');
    } finally {
      setIsLoading(false);
    }
  };

  const handle_select_version = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter(id => id !== versionId));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, versionId]);
    }
  };

  const handle_compare = () => {
    if (selectedVersions.length === 2) {
      const version1 = versions.find(v => v.id === selectedVersions[0]);
      const version2 = versions.find(v => v.id === selectedVersions[1]);
      if (version1 && version2) {
        onCompareVersions(String(version1.version), String(version2.version));
        onClose();
      }
    }
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

  const format_file_size = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Historial de Versiones
            </h2>
            <p className="text-sm text-zinc-500 mt-1">{fileName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#540c97' }} />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-16">
              <Clock className="w-16 h-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
              <p className="text-zinc-500 dark:text-zinc-400">
                No hay versiones disponibles
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => {
                const isSelected = selectedVersions.includes(version.id);
                const isCurrent = index === 0;

                return (
                  <div
                    key={version.id}
                    className={`border rounded-xl p-4 transition-all ${
                      isSelected
                        ? 'border-2 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                    } ${isCurrent ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                    style={isSelected ? { borderColor: '#540c97' } : {}}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handle_select_version(version.id)}
                          disabled={selectedVersions.length >= 2 && !isSelected}
                          className="mt-1 w-4 h-4 rounded border-zinc-300 focus:ring-2"
                          style={{ accentColor: '#540c97' }}
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-zinc-900 dark:text-white">
                              Versión {version.version}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-1 text-xs font-medium text-white rounded-full" style={{ backgroundColor: '#540c97' }}>
                                Actual
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{version.uploadedByName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{format_date(version.createdAt)}</span>
                            </div>
                          </div>

                          <div className="mt-2 text-sm text-zinc-500">
                            {format_file_size(version.fileSize)}
                          </div>

                          {version.changes && (
                            <div className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-900 rounded text-sm text-zinc-600 dark:text-zinc-400">
                              {version.changes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => {
                            onViewVersion(version.id, version.version);
                            onClose();
                          }}
                          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                          title="Ver versión"
                        >
                          <Eye className="w-5 h-5" style={{ color: '#540c97' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handle_compare}
            disabled={selectedVersions.length !== 2}
            className="flex-1 px-4 py-3 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: '#540c97' }}
            onMouseEnter={(e) => selectedVersions.length === 2 && (e.currentTarget.style.backgroundColor = '#6b0ec4')}
            onMouseLeave={(e) => selectedVersions.length === 2 && (e.currentTarget.style.backgroundColor = '#540c97')}
          >
            <GitCompare className="w-5 h-5" />
            Comparar Seleccionadas {selectedVersions.length > 0 && `(${selectedVersions.length}/2)`}
          </button>
        </div>
      </div>
    </div>
  );
}

