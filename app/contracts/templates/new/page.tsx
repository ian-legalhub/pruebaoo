'use client';

import { useEffect, useMemo, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ContractsFormsService } from '../../../lib/contracts-forms-service';
import { ContractsForm, ContractsFormField, ContractsFormListItem } from '../../../types/contracts';
import { FileService } from '../../../lib/file-service';
import { ArrowLeft, Loader2, FileUp, FilePlus, Check, Clipboard, FileText } from 'lucide-react';

interface PlaceholderRow {
  fieldId: string;
  label: string;
  byTitle: string | null;
  byId: string | null;
}

const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const build_placeholders = (formFields: ContractsFormField[]): PlaceholderRow[] =>
  formFields.map((field) => ({
    fieldId: field.id,
    label: field.title,
    byTitle: field.title ? `{{form_${slugify(field.title)}}}` : null,
    byId: field.id ? `{{field_${field.id.replace(/-/g, '_')}}}` : null,
  }));

export default function NewContractTemplatePage() {
  const router = useRouter();

  const [forms, setForms] = useState<ContractsFormListItem[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [selectedForm, setSelectedForm] = useState<ContractsForm | null>(null);
  const [isLoadingForms, setIsLoadingForms] = useState(false);
  const [isLoadingFormDetail, setIsLoadingFormDetail] = useState(false);
  const [error, setError] = useState<string>('');

  const [selectedTemplateFile, setSelectedTemplateFile] = useState<File | null>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [blankTemplateName, setBlankTemplateName] = useState('');

  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const open_editor_for_file = (fileId: string) => {
    if (!fileId) return;
    if (selectedForm?.contractsFormId) {
      router.push(
        `/editor/${fileId}?mode=edit&contractsFormId=${selectedForm.contractsFormId}`,
      );
      return;
    }
    router.push(`/editor/${fileId}?mode=edit`);
  };

  useEffect(() => {
    const load_forms = async () => {
      setIsLoadingForms(true);
      setError('');
      try {
        const response = await ContractsFormsService.list_forms();
        setForms(response);
      } catch (err: any) {
        console.error('Error al cargar formularios de contrato:', err);
        setError(
          err?.message || 'Error al cargar los formularios de contrato. Verifica la API /contracts-forms.',
        );
      } finally {
        setIsLoadingForms(false);
      }
    };

    load_forms();
  }, []);

  useEffect(() => {
    if (!selectedFormId) return;

    const load_form_detail = async () => {
      setIsLoadingFormDetail(true);
      setError('');
      try {
        const form = await ContractsFormsService.get_form(selectedFormId);
        setSelectedForm(form);
        if (!blankTemplateName) {
          setBlankTemplateName(`Plantilla - ${form.name}.docx`);
        }
      } catch (err: any) {
        console.error('Error al cargar formulario de contrato:', err);
        setError(
          err?.message || 'Error al cargar el formulario seleccionado. Verifica la API /contracts-forms/:id.',
        );
      } finally {
        setIsLoadingFormDetail(false);
      }
    };

    load_form_detail();
  }, [selectedFormId, blankTemplateName]);

  const placeholders: PlaceholderRow[] = useMemo(
    () => (selectedForm ? build_placeholders(selectedForm.form || []) : []),
    [selectedForm],
  );

  const handle_back = () => {
    router.push('/dashboard');
  };

  const handle_form_change = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) {
      setSelectedFormId(null);
      setSelectedForm(null);
      return;
    }
    setSelectedFormId(Number(value));
  };

  const handle_template_file_change = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedTemplateFile(file);
    }
  };

  const copy_to_clipboard = async (value: string | null) => {
    if (!value) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = value;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedValue(value);
      setTimeout(() => setCopiedValue(null), 2000);
    } catch (err) {
      console.error('No se pudo copiar al portapapeles', err);
    }
  };

  const handle_upload_template = async () => {
    if (!selectedForm || !selectedTemplateFile) return;

    setIsSavingTemplate(true);
    setError('');

    try {
      const file = await FileService.upload_file(selectedTemplateFile, {
        isTemplate: true,
      });

      const updatedForm = await ContractsFormsService.set_template(
        selectedForm.contractsFormId,
        file.id,
      );
      setSelectedForm(updatedForm);

      open_editor_for_file(file.id);
    } catch (err: any) {
      console.error('Error al subir o asociar plantilla:', err);
      setError(
        err?.message || 'Error al subir o asociar la plantilla. Verifica /files/upload y /contracts-forms/:id.',
      );
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handle_create_blank_template = async () => {
    if (!selectedForm || !blankTemplateName.trim()) return;

    setIsSavingTemplate(true);
    setError('');

    try {
      const file = await FileService.create_blank_file({
        fileName: blankTemplateName.trim(),
        isTemplate: true,
      });

      const updatedForm = await ContractsFormsService.set_template(
        selectedForm.contractsFormId,
        file.id,
      );
      setSelectedForm(updatedForm);

      open_editor_for_file(file.id);
    } catch (err: any) {
      console.error('Error al crear o asociar plantilla en blanco:', err);
      setError(
        err?.message ||
          'Error al crear la plantilla en blanco. Verifica /files/create-blank y /contracts-forms/:id.',
      );
    } finally {
      setIsSavingTemplate(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f9f9' }}>
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={handle_back}
                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-zinc-900">Nueva plantilla de contrato</h1>
                <p className="text-sm text-zinc-600">
                  Selecciona un formulario de contrato y genera los placeholders para tu plantilla
                  DOCX.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <section className="bg-white rounded-2xl shadow border border-zinc-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900">1. Seleccionar formulario</h2>
          <p className="text-sm text-zinc-600">
            Elige el tipo de contrato para el cual vas a diseñar la plantilla.
          </p>

          {isLoadingForms ? (
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando formularios de contrato...
            </div>
          ) : (
            <select
              value={selectedFormId ?? ''}
              onChange={handle_form_change}
              className="w-full max-w-md px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
            >
              <option value="">Selecciona un formulario...</option>
              {Array.isArray(forms) &&
                forms.map((form) => (
                  <option key={form.contractsFormId} value={form.contractsFormId}>
                    {form.name}
                  </option>
                ))}
            </select>
          )}

          {selectedForm && (
            <div className="mt-2 flex flex-col gap-2 text-xs text-zinc-600">
              {selectedForm.fileId ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                    <Check className="w-3 h-3" />
                    Plantilla asociada (fileId: {selectedForm.fileId})
                  </span>
                  <button
                    type="button"
                    onClick={() => open_editor_for_file(selectedForm.fileId as string)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-zinc-300 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    Editar plantilla en OnlyOffice
                  </button>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200">
                  Aún no hay plantilla asociada a este formulario.
                </span>
              )}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow border border-zinc-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            2. Placeholders generados a partir del formulario
          </h2>
          <p className="text-sm text-zinc-600">
            Copia estos placeholders y pégalos en tu documento Word (.docx). El backend usará estos
            tokens para reemplazar los valores al generar documentos.
          </p>

          {isLoadingFormDetail && (
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando campos del formulario...
            </div>
          )}

          {!selectedForm && !isLoadingFormDetail && (
            <p className="text-sm text-zinc-500">
              Selecciona primero un formulario de contrato para ver sus placeholders.
            </p>
          )}

          {selectedForm && placeholders.length === 0 && !isLoadingFormDetail && (
            <p className="text-sm text-zinc-500">
              Este formulario no tiene campos configurados todavía.
            </p>
          )}

          {selectedForm && placeholders.length > 0 && (
            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-zinc-200 text-sm">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-zinc-700">Campo</th>
                    <th className="px-4 py-2 text-left font-medium text-zinc-700">
                      Placeholder por título 
                    </th>

                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {placeholders.map((row) => (
                    <tr key={row.fieldId} className="hover:bg-zinc-50">
                      <td className="px-4 py-2 align-top">
                        <div className="font-medium text-zinc-900">{row.label}</div>
                        <div className="text-xs text-zinc-500 break-all mt-0.5">
                          ID: {row.fieldId}
                        </div>
                      </td>
                      <td className="px-4 py-2 align-top">
                        {row.byTitle ? (
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 rounded bg-zinc-100 text-xs font-mono break-all">
                              {row.byTitle}
                            </code>
                            <button
                              type="button"
                              onClick={() => copy_to_clipboard(row.byTitle)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-zinc-300 rounded-lg hover:bg-zinc-100 transition-colors"
                            >
                              {copiedValue === row.byTitle ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  Copiado
                                </>
                              ) : (
                                <>
                                  <Clipboard className="w-3 h-3" />
                                  Copiar
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400">No disponible</span>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow border border-zinc-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            3. Crear o subir plantilla DOCX
          </h2>
          <p className="text-sm text-zinc-600">
            Una vez asociada una plantilla al formulario, el backend usará ese archivo como base
            para generar documentos de este tipo de contrato.
          </p>

          {!selectedForm && (
            <p className="text-sm text-zinc-500">
              Selecciona primero un formulario para poder asociar una plantilla.
            </p>
          )}

          {selectedForm && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-zinc-900">
                  Opción A: Subir plantilla existente (.docx)
                </h3>
                <p className="text-xs text-zinc-600">
                  Sube un archivo Word que ya tenga los placeholders copiados.
                </p>
                <input
                  type="file"
                  accept=".docx,.doc"
                  onChange={handle_template_file_change}
                  className="block w-full text-sm text-zinc-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  disabled={isSavingTemplate}
                />
                <button
                  type="button"
                  onClick={handle_upload_template}
                  disabled={!selectedTemplateFile || isSavingTemplate}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#540c97' }}
                >
                  {isSavingTemplate ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FileUp className="w-4 h-4" />
                      Subir y asociar plantilla
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-zinc-900">
                  Opción B: Crear plantilla en blanco
                </h3>
                <p className="text-xs text-zinc-600">
                  Crea un .docx vacío que luego podrás editar en OnlyOffice usando estos
                  placeholders.
                </p>
                <input
                  type="text"
                  value={blankTemplateName}
                  onChange={(e) => setBlankTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Nombre del archivo, por ejemplo: Plantilla - Contrato de servicios.docx"
                  disabled={isSavingTemplate}
                />
                <button
                  type="button"
                  onClick={handle_create_blank_template}
                  disabled={!blankTemplateName.trim() || isSavingTemplate}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#540c97' }}
                >
                  {isSavingTemplate ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <FilePlus className="w-4 h-4" />
                      Crear y asociar plantilla en blanco
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

