<?php

namespace JEELSHHA\Services;

use JEELSHHA\Models\Headers;

defined('ABSPATH') or die();


class HeaderValidator
{
    /**
     * Allowed characters for a valid HTTP header name.
     */
    public const NAME_PATTERN = '/^[A-Za-z0-9-]+$/';

    /**
     * CSP directive keys that contain a space-separated list of source expressions.
     */
    public const CSP_SOURCE_KEYS = [
        'csp_default_src',
        'csp_script_src',
        'csp_style_src',
        'csp_img_src',
        'csp_connect_src',
        'csp_font_src',
        'csp_object_src',
        'csp_base_uri',
        'csp_frame_ancestors',
        'csp_form_action',
    ];

    /**
     * CSP keywords that must be quoted with single quotes.
     */
    private const CSP_KEYWORDS = [
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

    private const CSP_NONCE_HASH_PATTERN = '/^(sha256|sha384|sha512|nonce)-[A-Za-z0-9+\/=]+$/i';
    private const CSP_SCHEME_PATTERN = '/^[a-zA-Z][a-zA-Z0-9+.-]*:$/';
    private const CSP_HOST_SOURCE_PATTERN = '/^[a-zA-Z0-9.*_~!$&()*+,=:%\/?#@\[\]-]+$/';

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

        if (\preg_match('/[\x00-\x1F\x7F\s]/', $uri)) {
            return false;
        }

        $parts = \wp_parse_url($uri);

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
     * Sanitize a CSP source list (space-separated source expressions).
     *
     * Preserves whitespace separators, corrects unquoted keywords and removes
     * surrounding quotes from URLs/schemes/hosts.
     *
     * @param string $value
     * @param string $field
     * @return string
     * @throws \InvalidArgumentException
     */
    public static function sanitizeCspSourceList(string $value, string $field = ''): string
    {
        $value = \trim((string) $value);

        if ($value === '') {
            return '';
        }

        $parts = \preg_split('/(\s+)/', $value, -1, PREG_SPLIT_DELIM_CAPTURE);

        if ($parts === false) {
            return $value;
        }

        $result = [];

        foreach ($parts as $part) {
            if (\preg_match('/^\s+$/', $part)) {
                $result[] = $part;
                continue;
            }

            if ($part === '') {
                $result[] = $part;
                continue;
            }

            $tokenResult = self::correctCspToken($part);

            if ($tokenResult['error'] !== null) {
                throw new \InvalidArgumentException(
                    \esc_html(
                        \sprintf(
                            /* translators: 1: CSP field name, 2: error message */
                            \__('%1$s: %2$s', 'http-headers-advanced'),
                            $field ? $field : 'CSP source list',
                            $tokenResult['error']
                        )
                    )
                );
            }

            $result[] = $tokenResult['corrected'];
        }

        return \implode('', $result);
    }

    /**
     * Correct a single CSP source expression token.
     *
     * @param string $token
     * @return array<string, string|null>
     */
    private static function correctCspToken(string $token): array
    {
        if ($token === '') {
            return ['corrected' => '', 'error' => null];
        }

        $first = $token[0];
        $last = \substr($token, -1);
        $hasQuotes = ($first === "'" || $first === '"') && $first === $last && \strlen($token) > 1;

        if (!$hasQuotes && ($first === "'" || $first === '"' || $last === "'" || $last === '"')) {
            return ['corrected' => $token, 'error' => \__('Unmatched quotes in CSP token.', 'http-headers-advanced')];
        }

        $inner = $hasQuotes ? \substr($token, 1, -1) : $token;
        $lowerInner = \strtolower($inner);

        if (\in_array($lowerInner, self::CSP_KEYWORDS, true)) {
            $corrected = "'" . $lowerInner . "'";
            return ['corrected' => $corrected, 'error' => null];
        }

        if (\preg_match(self::CSP_NONCE_HASH_PATTERN, $inner)) {
            $dashPos = \strpos($inner, '-');
            $prefix = \strtolower(\substr($inner, 0, $dashPos));
            $rest = \substr($inner, $dashPos + 1);
            $corrected = "'" . $prefix . '-' . $rest . "'";
            return ['corrected' => $corrected, 'error' => null];
        }

        if ($hasQuotes) {
            if (!self::isValidSourceExpression($inner)) {
                return [
                    'corrected' => $inner,
                    'error' => \sprintf(
                        /* translators: %s: token value */
                        \__('Invalid CSP source expression: %s', 'http-headers-advanced'),
                        $token
                    ),
                ];
            }
            return ['corrected' => $inner, 'error' => null];
        }

        if (!self::isValidSourceExpression($token)) {
            return [
                'corrected' => $token,
                'error' => \sprintf(
                    /* translators: %s: token value */
                    \__('Invalid CSP source expression: %s', 'http-headers-advanced'),
                    $token
                ),
            ];
        }

        return ['corrected' => $token, 'error' => null];
    }

    /**
     * Check if a CSP source expression token is syntactically valid.
     *
     * @param string $value
     * @return bool
     */
    private static function isValidSourceExpression(string $value): bool
    {
        if ($value === '') {
            return false;
        }

        if (\preg_match('/[\x00-\x1F\x7F]/', $value)) {
            return false;
        }

        $invalidChars = ['"', "'", '<', '>', '{', '}', '|', '`', '\\', ';'];
        foreach ($invalidChars as $char) {
            if (\str_contains($value, $char)) {
                return false;
            }
        }

        if (\preg_match(self::CSP_SCHEME_PATTERN, $value)) {
            return true;
        }

        return \preg_match(self::CSP_HOST_SOURCE_PATTERN, $value) === 1;
    }

    /**
     * Sanitize a CSP report-uri value.
     *
     * @param string $uri
     * @param string $field
     * @return string
     * @throws \InvalidArgumentException
     */
    public static function sanitizeCspReportUri(string $uri, string $field = 'csp_report_uri'): string
    {
        $uri = \trim((string) $uri);

        $first = $uri[0] ?? '';
        $last = \substr($uri, -1);
        if (($first === "'" || $first === '"') && $first === $last && \strlen($uri) > 1) {
            $uri = \trim(\substr($uri, 1, -1));
        } elseif ($first === "'" || $first === '"' || $last === "'" || $last === '"') {
            throw new \InvalidArgumentException(
                \esc_html(
                    \sprintf(
                        /* translators: %s: field name */
                        \__('%s has unmatched quotes.', 'http-headers-advanced'),
                        $field
                    )
                )
            );
        }

        if ($uri === '') {
            return '';
        }

        if (!self::isValidReportUri($uri)) {
            throw new \InvalidArgumentException(
                \esc_html(
                    \sprintf(
                        /* translators: %s: field name */
                        \__('%s must be a valid https URL.', 'http-headers-advanced'),
                        $field
                    )
                )
            );
        }

        return $uri;
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
                $sanitized[$key] = self::sanitizeCspReportUri($value, $key);
                continue;
            }

            if (\in_array($key, self::CSP_SOURCE_KEYS, true)) {
                $sanitized[$key] = self::sanitizeCspSourceList($value, $key);
                continue;
            }

            $sanitized[$key] = self::sanitizeValue($value);
        }

        return $sanitized;
    }
}
