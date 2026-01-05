'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileService } from '../../lib/file-service';
import { OnlyOfficeConfig } from '../../types/file';
import { CollaborationService } from '../../lib/collaboration-service';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import PlaceholderPanel from '../../components/placeholder-panel';
import { ContractsFormsService } from '../../lib/contracts-forms-service';
import { build_placeholders_from_form } from '../../lib/placeholders';

declare global {
  interface Window {
    DocsAPI?: {
      DocEditor: new (id: string, config: any) => any;
    };
  }
}

// Componente para mostrar mensajes de pantalla completa (loading o error)
const FullScreenMessage = ({
  icon,
  title,
  message,
  buttonText,
  onButtonClick,
}: {
  icon: React.ReactNode;
  title?: string;
  message: string;
  buttonText?: string;
  onButtonClick?: () => void;
}) => (
  <div
    className="min-h-screen flex items-center justify-center"
    style={{ backgroundColor: '#f5f9f9' }}
  >
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 text-center">
      {icon}
      {title && <h2 className="text-xl font-bold text-zinc-900 mb-2">{title}</h2>}
      <p className="text-zinc-600 mb-6">{message}</p>
      {buttonText && onButtonClick && (
        <button
          onClick={onButtonClick}
          className="w-full px-4 py-3 text-white rounded-lg font-medium transition-all"
          style={{ backgroundColor: '#540c97' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#6b0ec4')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#540c97')}
        >
          {buttonText}
        </button>
      )}
    </div>
  </div>
);

export default function EditorPage({ params }: { params: Promise<{ fileId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fileId } = use(params);

  const [config, setConfig] = useState<OnlyOfficeConfig | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isDocumentReady, setIsDocumentReady] = useState(false);
  const [contractPlaceholders, setContractPlaceholders] = useState<
    { key: string; label: string; category?: string }[]
  >([]);

  const editorRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  const isInitializingRef = useRef(false);
  const currentConfigRef = useRef<string | null>(null);
  const editorInstanceRef = useRef<any>(null);
  const isRefreshingRef = useRef(false);

  // Helper para manejo de errores de manera centralizada
  const handleError = (msg: string, err?: any) => {
    console.error(msg, err);
    setError(msg);
  };

  // Helper seguro para destruir editor
  const destroyEditorSafe = () => {
    const instance = editorInstanceRef.current || editorInstance;
    if (instance) {
      try {
        instance.destroyEditor();
      } catch (err) {
        console.error('Error destroying editor:', err);
      }
      editorInstanceRef.current = null;
    }
  };

  // Leer parámetros de URL de manera centralizada
  const getEditorParams = () => ({
    mode: searchParams.get('mode') || 'edit',
    version: searchParams.get('version'),
    v1: searchParams.get('v1'),
    v2: searchParams.get('v2'),
    contractsFormId: searchParams.get('contractsFormId'),
  });

  const { mode, version, v1, v2, contractsFormId } = getEditorParams();

  useEffect(() => {
    load_editor_config();
    return () => {
      cleanup();
    };
  }, [fileId, mode, version, v1, v2]);

  useEffect(() => {
    const load_contract_placeholders = async () => {
      if (!contractsFormId) {
        setContractPlaceholders([]);
        return;
      }

      try {
        const form = await ContractsFormsService.get_form(contractsFormId);
        const dynamicPlaceholders = build_placeholders_from_form(form.form || []);
        setContractPlaceholders(dynamicPlaceholders);
      } catch (err) {
        console.error('Error al cargar placeholders del formulario de contrato:', err);
        setContractPlaceholders([]);
      }
    };

    load_contract_placeholders();
  }, [contractsFormId]);

  // Cargar configuración del editor
  const load_editor_config = async () => {
    setIsLoading(true);
    setError('');

    try {
      let editorConfig: OnlyOfficeConfig;

      if (v1 && v2) {
        editorConfig = await FileService.compare_versions(fileId, v1, v2);
      } else if (version) {
        editorConfig = await FileService.open_version_in_editor(
          fileId,
          parseInt(version, 10)
        );
      } else {
        editorConfig = await FileService.open_in_editor(
          fileId,
          mode as 'edit' | 'view'
        );
      }

      setConfig(editorConfig);
      if (editorConfig.sessionId) setSessionId(editorConfig.sessionId);

      if (editorConfig.editorApiUrl) {
        load_onlyoffice_script(editorConfig.editorApiUrl, editorConfig);
      } else {
        handleError('No se pudo obtener la URL del editor OnlyOffice');
      }
    } catch (err: any) {
      handleError('Error al cargar el editor', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar script de OnlyOffice dinámicamente
  const load_onlyoffice_script = (editorApiUrl: string, editorConfig: OnlyOfficeConfig) => {
    // Crear una clave única para esta configuración
    const configKey = JSON.stringify({
      fileId,
      key: editorConfig.config?.document?.key,
      mode,
      version,
      v1,
      v2,
    });

    // Si ya estamos inicializando con la misma configuración, ignorar
    if (isInitializingRef.current && currentConfigRef.current === configKey) {
      return;
    }

    // Si el script ya está cargado y la configuración es la misma, solo inicializar
    if (scriptLoadedRef.current) {
      if (currentConfigRef.current === configKey) {
        return; // Ya está inicializado con esta configuración
      }
      initialize_editor(editorConfig, configKey);
      return;
    }

    const script = document.createElement('script');
    script.src = editorApiUrl;
    script.async = true;

    script.onload = () => {
      scriptLoadedRef.current = true;
      initialize_editor(editorConfig, configKey);
    };

    script.onerror = () => handleError('Error al cargar el script de OnlyOffice');

    document.head.appendChild(script);
  };

  // Inicializar editor OnlyOffice
  const initialize_editor = (editorConfig: OnlyOfficeConfig, configKey: string) => {
    if (!editorRef.current || !window.DocsAPI) return;

    // Prevenir múltiples inicializaciones simultáneas
    if (isInitializingRef.current) {
      console.warn('Editor initialization already in progress, skipping...');
      return;
    }

    if (currentConfigRef.current === configKey && editorInstanceRef.current) {
      return;
    }

    isInitializingRef.current = true;
    destroyEditorSafe(); // Destruir editor previo si existe

    const editorConfigObj = {
      ...editorConfig.config,
      events: {
        onAppReady: () => {
          console.log('OnlyOffice editor ready');
          setIsEditorReady(true);
          isInitializingRef.current = false;
        },
        onDocumentReady: () => {
          console.log('OnlyOffice document ready');
          setIsDocumentReady(true);
          // Resetear el flag de refresh cuando el documento esté listo
          if (isRefreshingRef.current) {
            console.log('OnlyOffice: Document refreshed successfully');
            isRefreshingRef.current = false;
          }
        },
        onDocumentStateChange: (event: any) =>
          console.log('Document state changed:', event.data),
        onError: (event: any) => {
          handleError('Error en el editor OnlyOffice', event.data);
          setIsEditorReady(false);
          setIsDocumentReady(false);
          isInitializingRef.current = false;
        },
        onInfo: (event: any) => console.log('OnlyOffice info:', event.data),
        onRequestRefreshFile: () => {
          // Prevenir múltiples llamadas simultáneas
          if (isRefreshingRef.current) {
            console.log('OnlyOffice: Refresh already in progress, skipping...');
            return;
          }

          console.log('OnlyOffice: File needs to be refreshed');
          isRefreshingRef.current = true;

          const instance = editorInstanceRef.current;
          
          // Intentar usar el método refreshFile si está disponible
          if (instance && typeof instance.refreshFile === 'function') {
            try {
              instance.refreshFile();
              // El flag se reseteará cuando onDocumentReady se dispare después del refresh
              // Pero también ponemos un timeout de seguridad más corto
              setTimeout(() => {
                if (isRefreshingRef.current) {
                  console.log('OnlyOffice: Refresh timeout, resetting flag');
                  isRefreshingRef.current = false;
                }
              }, 2000);
              return; // Salir temprano si refreshFile fue exitoso
            } catch (err) {
              console.error('Error calling refreshFile:', err);
              isRefreshingRef.current = false;
            }
          } else {
            // Si refreshFile no está disponible, recargar la configuración del editor
            // con una nueva URL que incluya un timestamp para forzar la recarga
            console.log('OnlyOffice: refreshFile not available, reloading editor config...');
            isRefreshingRef.current = false;
            
            // Recargar la configuración inmediatamente
            load_editor_config();
          }
        },
      },
    };

    try {
      const instance = new window.DocsAPI.DocEditor('onlyoffice-editor', editorConfigObj);
      setEditorInstance(instance);
      editorInstanceRef.current = instance;
      currentConfigRef.current = configKey;
    } catch (err) {
      handleError('Error al inicializar el editor', err);
      isInitializingRef.current = false;
      editorInstanceRef.current = null;
    }
  };

  // Limpieza al desmontar
  const cleanup = () => {
    destroyEditorSafe();
    isInitializingRef.current = false;
    currentConfigRef.current = null;
    editorInstanceRef.current = null;
    isRefreshingRef.current = false;
    setIsEditorReady(false);
    setIsDocumentReady(false);

    if (sessionId) {
      CollaborationService.end_collaboration(sessionId).catch(console.error);
    }
  };

  const handle_back = () => router.push('/dashboard');

  // Render de loading
  if (isLoading) {
    return (
      <FullScreenMessage
        icon={<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#540c97' }} />}
        message="Cargando editor..."
      />
    );
  }

  // Render de error
  if (error) {
    return (
      <FullScreenMessage
        icon={<AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />}
        title="Error"
        message={error}
        buttonText="Volver al Dashboard"
        onButtonClick={handle_back}
      />
    );
  }

  // Render principal del editor
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f9f9' }}>
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={handle_back}
                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-zinc-900">
                  {config?.fileInfo?.fileName || 'Editor'}
                </h1>
                {config?.isHistoricalVersion && (
                  <p className="text-sm text-zinc-500">Versión histórica (solo lectura)</p>
                )}
                {config?.isComparison && (
                  <p className="text-sm text-zinc-500">Comparación de versiones</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <PlaceholderPanel
          editorInstance={editorInstance}
          isEditorReady={isEditorReady && isDocumentReady}
          isReadOnly={config?.readOnly || config?.isHistoricalVersion || config?.isComparison || mode === 'view'}
          placeholders={contractPlaceholders}
        />
        <div className="flex-1 overflow-hidden">
          <div
            id="onlyoffice-editor"
            ref={editorRef}
            className="w-full h-full"
            style={{ height: 'calc(100vh - 64px)' }}
          />
        </div>
      </main>
    </div>
  );
}

