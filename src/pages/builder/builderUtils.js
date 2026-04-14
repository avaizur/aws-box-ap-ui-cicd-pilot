import formDefinition from '../../../prompts/tab-builder/form.json';

export const FIELD_TYPES = [
  'checkbox',
  'datefield',
  'dropdown',
  'email',
  'number',
  'phone',
  'textfield',
  'textarea',
];

/**
 * Unique id for tabs/fields (UUID v4 shape). Does not use Web Crypto so it works on HTTP / non-secure contexts.
 */
export function newId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function toTitleCase(value) {
  return String(value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

export function normalizeType(rawType) {
  if (rawType === 'date') return 'datefield';
  return FIELD_TYPES.includes(rawType) ? rawType : 'textfield';
}

function normalizeFieldFromJson(field, idx) {
  const name = field.name || field.status || `field${idx + 1}`;
  const title = field.title || toTitleCase(name);
  const type = normalizeType(field.type);
  const choices =
    type === 'dropdown'
      ? Array.isArray(field.choices) && field.choices.length
        ? [...field.choices]
        : ['Choice 1', 'Choice 2']
      : [];
  const defaultValue = field.defaultValue ?? (type === 'checkbox' ? false : '');
  return {
    id: newId(),
    name,
    title,
    type,
    choices,
    defaultValue,
    required: Boolean(field.required),
    readonly: Boolean(field.readonly),
  };
}

export function normalizeSource(source) {
  return (Array.isArray(source) ? source : []).map((tab, tabIndex) => {
    const tabName = tab.tab || tab.name || `Tab ${tabIndex + 1}`;
    const rawFields = Array.isArray(tab.fields) ? tab.fields : [];
    const fields = rawFields.map((f, idx) => normalizeFieldFromJson(f, idx));
    return { id: newId(), name: toTitleCase(tabName), fields };
  });
}

export function buildInitialTabs() {
  return normalizeSource(formDefinition);
}

export function createDefaultField(fieldIndex) {
  const idx = fieldIndex + 1;
  return {
    id: newId(),
    name: `field${idx}`,
    title: `Field ${idx}`,
    type: 'textfield',
    choices: [],
    defaultValue: '',
    required: false,
    readonly: false,
  };
}

/**
 * Export current builder tabs to JSON (form.json shape), without runtime ids.
 * Types use `date` instead of `datefield` so output matches prompts/tab-builder/form.json.
 */
export function serializeBuilderTabsToJsonString(tabs) {
  const data = (Array.isArray(tabs) ? tabs : []).map((tab) => ({
    tab: tab.name,
    fields: (tab.fields || []).map((f) => {
      const autoTitle = toTitleCase(f.name);
      const field = {
        name: f.name,
        type: f.type === 'datefield' ? 'date' : f.type,
        required: Boolean(f.required),
        readonly: Boolean(f.readonly),
      };
      if (f.title && String(f.title).trim() !== '' && f.title !== autoTitle) {
        field.title = f.title;
      }
      if (f.type === 'dropdown' && Array.isArray(f.choices) && f.choices.length) {
        field.choices = [...f.choices];
      }
      const dv = f.defaultValue;
      if (dv !== '' && dv !== null && dv !== undefined) {
        field.defaultValue = dv;
      }
      return field;
    }),
  }));
  return JSON.stringify(data, null, 2);
}
