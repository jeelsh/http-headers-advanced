const KNOWN_KEYWORDS = [
  'self',
  'none',
  'unsafe-inline',
  'unsafe-eval',
  'strict-dynamic',
  'wasm-unsafe-eval',
  'report-sample',
  'unsafe-hashes',
  'inline-speculation-rules',
];

const KEYWORD_SET = new Set(KNOWN_KEYWORDS);

// nonce-... or sha256-/sha384-/sha512-... followed by base64 characters.
const HASH_OR_NONCE_RE = /^(?:sha256|sha384|sha512|nonce)-[A-Za-z0-9+/=]+$/;

// Scheme source such as https:, data:, blob:
const SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:$/;

// Allowed characters for a host / URL source expression.
const HOST_SOURCE_RE = /^[a-zA-Z0-9.*_~!$&()*+,=:%/?#@\[\]-]+$/;

// Characters that are invalid or dangerous inside an unquoted CSP source.
const INVALID_SOURCE_RE = /[\x00-\x1F\x7F"'<>{}|\\`]/;

function isValidReportUri(uri) {
  if (/\s/.test(uri) || /[\x00-\x1F\x7F]/.test(uri)) {
    return false;
  }

  try {
    const url = new URL(uri);
    if (!url.host) {
      return false;
    }
    return url.protocol.toLowerCase() === 'https:';
  } catch {
    return false;
  }
}

function normalizeHashOrNonce(inner) {
  const [prefix, ...rest] = inner.split('-');
  return `${prefix.toLowerCase()}-${rest.join('-')}`;
}

function parseToken(raw) {
  if (raw === '') {
    return { corrected: '', error: null, changed: false };
  }

  const first = raw[0];
  const last = raw[raw.length - 1];
  const hasMatchingQuotes = (first === "'" || first === '"') && first === last && raw.length > 1;

  if (!hasMatchingQuotes && (first === "'" || first === '"' || last === "'" || last === '"')) {
    return { corrected: raw, error: `Comillas sin emparejar en "${raw}"`, changed: false };
  }

  const inner = hasMatchingQuotes ? raw.slice(1, -1) : raw;
  const lowerInner = inner.toLowerCase();

  if (KEYWORD_SET.has(lowerInner)) {
    const corrected = `'${lowerInner}'`;
    return { corrected, error: null, changed: corrected !== raw };
  }

  if (HASH_OR_NONCE_RE.test(inner)) {
    const normalized = normalizeHashOrNonce(inner);
    const corrected = `'${normalized}'`;
    return { corrected, error: null, changed: corrected !== raw };
  }

  if (hasMatchingQuotes) {
    if (inner === '') {
      return { corrected: '', error: `Token vacío entre comillas`, changed: true };
    }
    if (INVALID_SOURCE_RE.test(inner) || inner.includes(';')) {
      return { corrected: inner, error: `Caracteres no permitidos en "${raw}"`, changed: true };
    }
    if (SCHEME_RE.test(inner) || HOST_SOURCE_RE.test(inner)) {
      return { corrected: inner, error: null, changed: true };
    }
    return { corrected: inner, error: `Origen no válido: "${raw}"`, changed: true };
  }

  if (INVALID_SOURCE_RE.test(raw) || raw.includes(';')) {
    return { corrected: raw, error: `Caracteres no permitidos en "${raw}"`, changed: false };
  }

  if (SCHEME_RE.test(raw) || HOST_SOURCE_RE.test(raw) || raw === '*') {
    return { corrected: raw, error: null, changed: false };
  }

  return { corrected: raw, error: `Token no reconocido: "${raw}"`, changed: false };
}

export function parseCspValue(value, mode = 'sources') {
  const input = String(value ?? '');

  if (mode === 'report-uri') {
    let raw = input;

    const first = raw[0] ?? '';
    const last = raw[raw.length - 1] ?? '';
    const hasMatchingQuotes = (first === "'" || first === '"') && first === last && raw.length > 1;

    if (!hasMatchingQuotes && (first === "'" || first === '"' || last === "'" || last === '"')) {
      return { corrected: input, error: 'Comillas sin emparejar en report-uri' };
    }

    if (hasMatchingQuotes) {
      raw = raw.slice(1, -1);
    }

    raw = raw.trim();

    if (raw === '') {
      return { corrected: '', error: null, errors: [] };
    }

    if (/\s/.test(raw)) {
      return { corrected: input, error: 'report-uri debe ser una única URL https://' };
    }

    if (isValidReportUri(raw)) {
      return { corrected: raw, error: null, errors: [] };
    }

    return { corrected: input, error: 'report-uri debe ser una URL https:// válida' };
  }

  const trimmed = input.trim();

  if (trimmed === '') {
    return { corrected: '', error: null, errors: [] };
  }

  // Split on whitespace while capturing the separators so we can preserve them.
  const parts = trimmed.split(/(\s+)/);

  const correctedParts = [];
  const errors = [];

  parts.forEach((part) => {
    if (/^\s+$/.test(part)) {
      correctedParts.push(part);
      return;
    }

    if (part === '') {
      correctedParts.push(part);
      return;
    }

    const result = parseToken(part);
    if (result.error) {
      errors.push({ token: part, message: result.error });
    }
    correctedParts.push(result.corrected);
  });

  const corrected = correctedParts.join('');
  const error = errors.length
    ? `${errors.length} error(es): ${errors.map((e) => e.message).join('; ')}`
    : null;

  return { corrected, error, errors };
}
