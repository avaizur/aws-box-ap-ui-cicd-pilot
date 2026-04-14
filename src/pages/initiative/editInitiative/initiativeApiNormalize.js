function propertyNameToCamelCase(name) {
  if (name == null || typeof name !== 'string') return name;
  const segments = name.replace(/_([a-zA-Z0-9])/g, (_, ch) => ch.toUpperCase());

  if (
    segments.length >= 2 &&
    segments[0] === segments[0].toUpperCase() &&
    segments[1] === segments[1].toLowerCase()
  ) {
    return segments[0].toLowerCase() + segments.slice(1);
  }

  if (segments.length === 1) {
    return segments.toLowerCase();
  }

  return segments;
}

export function deepCamelCaseKeys(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map((v) => deepCamelCaseKeys(v));
  if (typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [propertyNameToCamelCase(k), deepCamelCaseKeys(v)]),
  );
}

function looksLikeInitiativeBody(o) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return false;
  return (
    o.initiativeId != null ||
    o.initiative_id != null ||
    o.id != null ||
    Object.prototype.hasOwnProperty.call(o, 'itSubmissionSummary') ||
    Object.prototype.hasOwnProperty.call(o, 'itPartnershipOverview') ||
    Object.prototype.hasOwnProperty.call(o, 'itSolutionOverview') ||
    Object.prototype.hasOwnProperty.call(o, 'itSolutionTeamStructure') ||
    Object.prototype.hasOwnProperty.call(o, 'itAwsFeedback') ||
    Object.prototype.hasOwnProperty.call(o, 'submissionSummary') ||
    Object.prototype.hasOwnProperty.call(o, 'partnershipOverview') ||
    Object.prototype.hasOwnProperty.call(o, 'solutionOverview') ||
    Object.prototype.hasOwnProperty.call(o, 'solutionTeamStructure') ||
    Object.prototype.hasOwnProperty.call(o, 'awsFeedback')
  );
}

function unwrapInitiativePayload(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const candidates = [raw.data, raw.result, raw.payload, raw.body];
  for (const wrapped of candidates) {
    if (wrapped && typeof wrapped === 'object' && !Array.isArray(wrapped) && looksLikeInitiativeBody(wrapped)) {
      return wrapped;
    }
  }
  return raw;
}

export function normalizeInitiativeResponse(raw) {
  const unwrapped = unwrapInitiativePayload(raw);
  const api = deepCamelCaseKeys(unwrapped);

  if (api.itSubmissionSummary == null && api.submissionSummary != null) api.itSubmissionSummary = api.submissionSummary;
  if (api.itPartnershipOverview == null && api.partnershipOverview != null) api.itPartnershipOverview = api.partnershipOverview;
  if (api.itSolutionOverview == null && api.solutionOverview != null) api.itSolutionOverview = api.solutionOverview;
  if (api.itSolutionTeamStructure == null && api.solutionTeamStructure != null) api.itSolutionTeamStructure = api.solutionTeamStructure;
  if (api.itAwsFeedback == null && api.awsFeedback != null) api.itAwsFeedback = api.awsFeedback;

  if (api.initiativeId == null && api.id != null) api.initiativeId = api.id;

  return api;
}

export function tryParseJson(value) {
  if (typeof value !== 'string') return null;
  const t = value.trim();
  if (!t.startsWith('{') && !t.startsWith('[')) return null;
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}

