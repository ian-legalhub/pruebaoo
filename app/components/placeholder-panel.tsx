'use client';

import { Plus } from 'lucide-react';

interface PlaceholderField {
  key: string;
  label: string;
  category?: string;
}

interface PlaceholderPanelProps {
  editorInstance: any;
  isEditorReady?: boolean;
  isReadOnly?: boolean;
}

const PLACEHOLDER_FIELDS: PlaceholderField[] = [
  { key: 'client_name', label: 'Nombre del Cliente', category: 'Cliente' },
  { key: 'client_email', label: 'Email del Cliente', category: 'Cliente' },
  { key: 'client_phone', label: 'Teléfono del Cliente', category: 'Cliente' },
  { key: 'start_date', label: 'Fecha de Inicio', category: 'Fechas' },
  { key: 'end_date', label: 'Fecha de Fin', category: 'Fechas' },
  { key: 'contract_date', label: 'Fecha del Contrato', category: 'Fechas' },
  { key: 'amount', label: 'Monto', category: 'Financiero' },
  { key: 'currency', label: 'Moneda', category: 'Financiero' },
  { key: 'contract_number', label: 'Número de Contrato', category: 'Contrato' },
  { key: 'signature_date', label: 'Fecha de Firma', category: 'Contrato' },
];

const insertPlaceholder = (editorInstance: any, fieldKey: string, isEditorReady: boolean): boolean => {
  if (!isEditorReady) {
    console.warn('Editor no está listo aún');
    return false;
  }

  const placeholderText = `{{${fieldKey}}}`;

  try {
    let docEditor: any = null;

    if (typeof (window as any).DocsAPI !== 'undefined' && (window as any).DocsAPI.DocEditor) {
      const instances = (window as any).DocsAPI.DocEditor.instances;
      if (instances && instances['onlyoffice-editor']) {
        docEditor = instances['onlyoffice-editor'];
      }
    }

    if (!docEditor && editorInstance) {
      docEditor = editorInstance;
    }

    if (!docEditor) {
      console.warn('No se pudo obtener la instancia del editor');
      return false;
    }

    if (typeof docEditor.executeCommand === 'function') {
      docEditor.executeCommand('InsertText', [placeholderText]);
      return true;
    }

    if (typeof docEditor.insertText === 'function') {
      docEditor.insertText(placeholderText);
      return true;
    }

    if (docEditor.DocEditor && typeof docEditor.DocEditor.executeCommand === 'function') {
      docEditor.DocEditor.executeCommand('InsertText', [placeholderText]);
      return true;
    }

    console.warn('No se encontró método válido para insertar texto. Métodos disponibles:', Object.keys(docEditor || {}));
    return false;
  } catch (error) {
    console.error('Error al insertar placeholder:', error);
    return false;
  }
};

export default function PlaceholderPanel({ editorInstance, isEditorReady = false, isReadOnly = false }: PlaceholderPanelProps) {
  const handleFieldClick = (fieldKey: string) => {
    if (isReadOnly) {
      return;
    }

    const success = insertPlaceholder(editorInstance, fieldKey, isEditorReady);
    if (!success) {
      console.warn(`No se pudo insertar el placeholder para ${fieldKey}`);
    }
  };

  const fieldsByCategory = PLACEHOLDER_FIELDS.reduce((acc, field) => {
    const category = field.category || 'Otros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(field);
    return acc;
  }, {} as Record<string, PlaceholderField[]>);

  return (
    <div className="w-80 bg-white border-r border-zinc-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-zinc-200">
        <h2 className="text-lg font-semibold text-zinc-900">Campos Dinámicos</h2>
        <p className="text-sm text-zinc-600 mt-1">
          Haz clic en un campo para insertarlo en el documento
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {Object.entries(fieldsByCategory).map(([category, fields]) => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-medium text-zinc-700 mb-2 uppercase tracking-wide">
              {category}
            </h3>
            <div className="space-y-2">
              {fields.map((field) => (
                <button
                  key={field.key}
                  onClick={() => handleFieldClick(field.key)}
                  disabled={isReadOnly || !isEditorReady}
                  className="w-full text-left px-3 py-2 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-zinc-200 flex items-center gap-2 group"
                >
                  <Plus className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-900 truncate">
                      {field.label}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono truncate">
                      {`{{${field.key}}}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {(!isEditorReady || isReadOnly) && (
        <div className="p-4 border-t border-zinc-200 bg-zinc-50">
          <p className="text-xs text-zinc-600 text-center">
            {!isEditorReady
              ? 'Esperando a que el editor esté listo...'
              : 'Modo de solo lectura: los campos no se pueden insertar'}
          </p>
        </div>
      )}
    </div>
  );
}

