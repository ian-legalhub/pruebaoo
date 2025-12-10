'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileMetadata } from '../types/file';
import { FileService } from '../lib/file-service';
import { useAuth } from '../contexts/auth-context';
import { FileList } from '../components/file-list';
import { UploadFileModal } from '../components/upload-file-modal';
import { TenantConfig } from '../components/tenant-config';
import { ErrorDisplay } from './error-display';
import { FileVersionsModal } from '../components/file-versions-modal';
import { DuplicateFileModal } from '../components/duplicate-file-modal';
import { 
  Upload, 
  LogOut, 
  RefreshCw, 
  Loader2,
  FolderOpen
} from 'lucide-react';

export default function DashboardPage() {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    load_files();
  }, []);

  const load_files = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await FileService.list_files();
      setFiles(response.files);
    } catch (err: any) {
      console.error('Error al cargar archivos:', err);
      const error_message = err.response?.status === 404 
        ? 'El endpoint de archivos no existe. Verifica la URL de la API.'
        : err.message || 'Error al cargar los archivos';
      setError(error_message);
    } finally {
      setIsLoading(false);
    }
  };

  const handle_logout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handle_edit_file = async (fileId: string) => {
    try {
      const config = await FileService.open_in_editor(fileId, 'edit');
      router.push(`/editor/${fileId}?mode=edit`);
    } catch (error) {
      console.error('Error al abrir editor:', error);
      alert('Error al abrir el editor. Por favor, intenta de nuevo.');
    }
  };

  const handle_view_versions = (fileId: string, fileName: string) => {
    setSelectedFileId(fileId);
    setSelectedFileName(fileName);
    setIsVersionsModalOpen(true);
  };

  const handle_view_version = (versionId: string, version: number) => {
    router.push(`/editor/${selectedFileId}?mode=view&version=${version}`);
  };

  const handle_compare_versions = async (v1: string, v2: string) => {
    try {
      router.push(`/editor/${selectedFileId}?mode=compare&v1=${v1}&v2=${v2}`);
    } catch (error: any) {
      alert('Error al comparar las versiones. Por favor, intenta de nuevo.');
    }
  };

  const handle_duplicate = (fileId: string, fileName: string) => {
    setSelectedFileId(fileId);
    setSelectedFileName(fileName);
    setIsDuplicateModalOpen(true);
  };

  const handle_duplicate_file = async (fileId: string, options?: { suffix?: string; newName?: string }) => {
    await FileService.duplicate_file(fileId, options);
    await load_files();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f9f9' }}>
      <TenantConfig />
      <header style={{ backgroundColor: '#1a1818' }} className="border-b border-zinc-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#540c97' }}>
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Dashboard
                </h1>
                <p className="text-sm text-zinc-400">
                  Gestiona tus archivos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={load_files}
                disabled={isLoading}
                className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                title="Actualizar"
              >
                <RefreshCw className={`w-5 h-5 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handle_logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Mis Archivos
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              {files.length} {files.length === 1 ? 'archivo' : 'archivos'}
            </p>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition-all"
            style={{ backgroundColor: '#540c97' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6b0ec4'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#540c97'}
          >
            <Upload className="w-5 h-5" />
            Subir Archivo
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
            </div>
          ) : error ? (
            <ErrorDisplay 
              message="Error al cargar archivos" 
              details={error}
            />
          ) : (
            <FileList 
              files={files} 
              onRefresh={load_files}
              onEditFile={handle_edit_file}
              onViewVersions={handle_view_versions}
              onDuplicate={handle_duplicate}
            />
          )}
        </div>
      </main>

      <UploadFileModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={load_files}
      />

      <FileVersionsModal
        isOpen={isVersionsModalOpen}
        onClose={() => setIsVersionsModalOpen(false)}
        fileId={selectedFileId}
        fileName={selectedFileName}
        onViewVersion={handle_view_version}
        onCompareVersions={handle_compare_versions}
      />

      <DuplicateFileModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        fileId={selectedFileId}
        fileName={selectedFileName}
        onDuplicate={handle_duplicate_file}
      />
    </div>
  );
}

