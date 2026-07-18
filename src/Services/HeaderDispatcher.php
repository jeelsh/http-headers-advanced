<?php

namespace JEELSHHA\Services;

use JEELSHHA\Models\Headers;
use JEELSHHA\Models\ServerEnvironment;
use JEELSHHA\Services\HeaderValidator;

defined('ABSPATH') or die();


class HeaderDispatcher
{
    const OPTION_METHOD = 'http_headers_advanced_injection_method';

    /**
     * Decide el método de inyección y aplica las cabeceras.
     * Llamar después de guardar los settings.
     */
    public static function apply(): void
    {
        $headers = Headers::load();
        $built = $headers->buildHeaders();

        if (ServerEnvironment::canUseHtaccess()) {
            $written = HtaccessWriter::write($built);

            if ($written) {
                \update_option(self::OPTION_METHOD, 'htaccess');
                return;
            }
        }

        // Fallback: eliminar reglas de .htaccess si existían y usar PHP
        HtaccessWriter::remove();
        \update_option(self::OPTION_METHOD, 'php');
    }

    /**
     * Envía las cabeceras vía PHP.
     * Se conecta al hook `send_headers` de WordPress.
     * Solo actúa si el método de inyección es 'php'.
     */
    public static function sendViaPHP(): void
    {
        $method = \get_option(self::OPTION_METHOD, 'php');

        if ($method !== 'php') {
            return;
        }

        if (\headers_sent()) {
            return;
        }

        $headers = Headers::load();
        $built = $headers->buildHeaders();
        $built = HeaderValidator::sanitizeHeaders($built);

        foreach ($built as $name => $value) {
            \header($name . ': ' . $value);
        }
    }

    /**
     * Devuelve el método de inyección actual.
     *
     * @return string 'htaccess'|'php'
     */
    public static function getMethod(): string
    {
        return \get_option(self::OPTION_METHOD, 'php');
    }
}
