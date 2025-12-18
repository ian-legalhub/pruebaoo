import { ContractsFormField } from '../types/contracts';

export interface DynamicPlaceholderField {
  key: string;
  label: string;
  category?: string;
}

export const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

export const build_placeholders_from_form = (
  formFields: ContractsFormField[],
): DynamicPlaceholderField[] => {
  const placeholders: DynamicPlaceholderField[] = [];

  formFields.forEach((field) => {
    if (field.title) {
      placeholders.push({
        key: `form_${slugify(field.title)}`,
        label: field.title,
        category: 'Campos del formulario',
      });
    }

    if (field.id) {
      placeholders.push({
        key: `field_${field.id.replace(/-/g, '_')}`,
        label: `${field.title || field.id} (UUID)`,
        category: 'Por UUID (opcional)',
      });
    }
  });

  return placeholders;
};


