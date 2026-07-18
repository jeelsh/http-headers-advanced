<?php

namespace JEELSHHA\Services;

use JEELSHHA\Models\Headers;

class HeaderValidator
{
    /**
     * Allowed characters for a valid HTTP header name.
     */
    public const NAME_PATTERN = '/^[A-Za-z0-9-]+$/';

    /**
     * Sanitize an HTTP header name.
     *
     * @param string $name
     * @return string The sanitized name or an empty string if invalid.
     */
    public static function sanitizeName(string $name): string
    {
        $name = \trim($name);

        if ($name === '' || !\preg_match(self::NAME_PATTERN, $name)) {
            return '';
        }

        return $name;
    }

    /**
     * Sanitize an HTTP header value.
     *
     * Removes CR, LF, NUL and other control characters that could be
     * abused for header injection or response splitting.
     *
     * @param string $value
     * @return string
     */
    public static function sanitizeValue(string $value): string
    {
        // Strip control characters (0x00-0x1F and 0x7F). This includes \r, \n and \0.
        $value = \preg_replace('/[\x00-\x1F\x7F]/', '', $value);

        return \trim($value);
    }

    /**
     * Validate a CSP report-uri value.
     *
     * Empty values are allowed. Non-empty values must be a valid URL with
     * an https:// scheme.
     *
     * @param string $uri
     * @return bool
     */
    public static function isValidReportUri(string $uri): bool
    {
        $uri = \trim($uri);

        if ($uri === '') {
            return true;
        }

        if (\preg_match('/[\x00-\x1F\x7F]/', $uri)) {
            return false;
        }

        $parts = \parse_url($uri);

        if ($parts === false || !isset($parts['scheme'], $parts['host']) || $parts['host'] === '') {
            return false;
        }

        return \strtolower($parts['scheme']) === 'https';
    }

    /**
     * Sanitize a full map of headers.
     *
     * @param array<string, string> $headers
     * @return array<string, string>
     */
    public static function sanitizeHeaders(array $headers): array
    {
        $result = [];

        foreach ($headers as $name => $value) {
            $name = self::sanitizeName($name);

            if ($name === '') {
                continue;
            }

            $result[$name] = self::sanitizeValue((string) $value);
        }

        return $result;
    }

    /**
     * Validate and sanitize the raw settings payload before saving.
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     * @throws \InvalidArgumentException If csp_report_uri is not a valid https URL.
     */
    public static function validateSettings(array $data): array
    {
        $sanitized = [];
        $schema = Headers::schema();

        foreach ($data as $key => $value) {
            if (!\array_key_exists($key, $schema)) {
                continue;
            }

            $default = $schema[$key];

            if (\is_bool($default)) {
                $sanitized[$key] = \filter_var($value, FILTER_VALIDATE_BOOLEAN);
                continue;
            }

            if (\is_int($default)) {
                $sanitized[$key] = (int) $value;
                continue;
            }

            $value = (string) $value;

            if ($key === 'csp_report_uri') {
                if (!self::isValidReportUri($value)) {
                    throw new \InvalidArgumentException(
                        \__('csp_report_uri must be a valid https URL.', 'http-headers-advanced')
                    );
                }
                $sanitized[$key] = \trim($value);
                continue;
            }

            $sanitized[$key] = self::sanitizeValue($value);
        }

        return $sanitized;
    }
}
