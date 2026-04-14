import { tryParseJson } from './initiativeApiNormalize';

function isPlainObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

export function extractObjectByCandidates(api, candidates) {
  if (!api || typeof api !== 'object') return {};

  for (const key of candidates) {
    let v = api[key];
    const parsed = tryParseJson(v);
    if (parsed && isPlainObject(parsed)) v = parsed;

    if (isPlainObject(v) && Object.keys(v).length > 0) return v;
  }

  // If all objects are empty, return the first plain object (if any), otherwise {}
  for (const key of candidates) {
    const v = api[key];
    if (isPlainObject(v)) return v;
  }
  return {};
}

export function extractArrayByCandidates(api, candidates) {
  if (!api || typeof api !== 'object') return [];

  for (const key of candidates) {
    let v = api[key];
    const parsed = tryParseJson(v);
    if (parsed && Array.isArray(parsed)) v = parsed;

    if (Array.isArray(v)) return v;
    if (isPlainObject(v) && Array.isArray(v.items)) return v.items;
    if (isPlainObject(v) && Array.isArray(v.data)) return v.data;
  }

  return [];
}

