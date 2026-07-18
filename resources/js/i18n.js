import { __ as wp__, _x as wpX, _n as wpN, _nx as wpNx, sprintf as wpSprintf } from '@wordpress/i18n';

const DEFAULT_DOMAIN = 'http-headers-advanced';

export const __ = (text, domain = DEFAULT_DOMAIN) => wp__(text, domain);
export const _x = (text, context, domain = DEFAULT_DOMAIN) => wpX(text, context, domain);
export const _n = (single, plural, number, domain = DEFAULT_DOMAIN) => wpN(single, plural, number, domain);
export const _nx = (single, plural, number, context, domain = DEFAULT_DOMAIN) => wpNx(single, plural, number, context, domain);
export const sprintf = (format, ...args) => wpSprintf(format, ...args);
