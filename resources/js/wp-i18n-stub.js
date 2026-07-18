const fallback = {
  __: (text) => text,
  _x: (text) => text,
  _n: (single, plural, number) => (number === 1 ? single : plural),
  _nx: (single, plural, number) => (number === 1 ? single : plural),
  sprintf: (format, ...args) => args.reduce((result, argument) => result.replace(/%(?:\d+\$)?[sd]/, argument), format),
};

const i18n = typeof window !== 'undefined' ? window.wp?.i18n ?? fallback : fallback;

export const { __, _x, _n, _nx, sprintf } = i18n;
export default i18n;
