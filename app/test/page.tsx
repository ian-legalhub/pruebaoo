'use client';

import { useState } from 'react';
import { FileService } from '../lib/file-service';
import { CollaborationService } from '../lib/collaboration-service';
import { AuthService } from '../lib/auth-service';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export default function TestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const test_endpoints = async () => {
    setIsRunning(true);
    setResults([]);

    const tests: TestResult[] = [];

    const add_result = (name: string, status: 'success' | 'error', message?: string) => {
      tests.push({ name, status, message });
      setResults([...tests]);
    };

    try {
      add_result('Listar archivos', 'pending');
      try {
        await FileService.list_files();
        add_result('Listar archivos', 'success');
      } catch (err: any) {
        add_result('Listar archivos', 'error', err.message);
      }

      add_result('Obtener historial de archivo', 'pending');
      try {
        const files = await FileService.list_files();
        if (files.files && files.files.length > 0) {
          await FileService.get_file_history(files.files[0].id);
          add_result('Obtener historial de archivo', 'success');
        } else {
          add_result('Obtener historial de archivo', 'error', 'No hay archivos para probar');
        }
      } catch (err: any) {
        add_result('Obtener historial de archivo', 'error', err.message);
      }

      add_result('Abrir archivo en editor', 'pending');
      try {
        const files = await FileService.list_files();
        if (files.files && files.files.length > 0) {
          await FileService.open_in_editor(files.files[0].id, 'view');
          add_result('Abrir archivo en editor', 'success');
        } else {
          add_result('Abrir archivo en editor', 'error', 'No hay archivos para probar');
        }
      } catch (err: any) {
        add_result('Abrir archivo en editor', 'error', err.message);
      }

      add_result('Obtener metadata de archivo', 'pending');
      try {
        const files = await FileService.list_files();
        if (files.files && files.files.length > 0) {
          await FileService.get_file_metadata(files.files[0].id);
          add_result('Obtener metadata de archivo', 'success');
        } else {
          add_result('Obtener metadata de archivo', 'error', 'No hay archivos para probar');
        }
      } catch (err: any) {
        add_result('Obtener metadata de archivo', 'error', err.message);
      }

      add_result('Obtener URL firmada', 'pending');
      try {
        const files = await FileService.list_files();
        if (files.files && files.files.length > 0) {
          await FileService.get_signed_url(files.files[0].id);
          add_result('Obtener URL firmada', 'success');
        } else {
          add_result('Obtener URL firmada', 'error', 'No hay archivos para probar');
        }
      } catch (err: any) {
        add_result('Obtener URL firmada', 'error', err.message);
      }

    } catch (err: any) {
      add_result('Error general', 'error', err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const success_count = results.filter(r => r.status === 'success').length;
  const error_count = results.filter(r => r.status === 'error').length;
  const pending_count = results.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f9f9' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 p-6">
          <h1 className="text-2xl font-bold text-zinc-900 mb-6">
            Prueba de Endpoints
          </h1>

          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={test_endpoints}
              disabled={isRunning}
              className="px-6 py-3 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ backgroundColor: '#540c97' }}
              onMouseEnter={(e) => !isRunning && (e.currentTarget.style.backgroundColor = '#6b0ec4')}
              onMouseLeave={(e) => !isRunning && (e.currentTarget.style.backgroundColor = '#540c97')}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Ejecutando pruebas...
                </>
              ) : (
                'Ejecutar Pruebas'
              )}
            </button>

            {results.length > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-600 font-medium">
                  Exitosos: {success_count}
                </span>
                <span className="text-red-600 font-medium">
                  Errores: {error_count}
                </span>
                <span className="text-zinc-500">
                  Pendientes: {pending_count}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {results.length === 0 && !isRunning && (
              <p className="text-zinc-500 text-center py-8">
                Haz clic en "Ejecutar Pruebas" para probar todos los endpoints
              </p>
            )}

            {results.map((result, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-4 rounded-lg border ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : result.status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                {result.status === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
                {result.status === 'error' && (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                {result.status === 'pending' && (
                  <Loader2 className="w-5 h-5 text-zinc-400 animate-spin flex-shrink-0" />
                )}

                <div className="flex-1">
                  <p className="font-medium text-zinc-900">{result.name}</p>
                  {result.message && (
                    <p className="text-sm text-zinc-600 mt-1">{result.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



