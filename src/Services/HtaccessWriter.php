<?php

namespace JEELSHHA\Services;

use JEELSHHA\Models\ServerEnvironment;
use JEELSHHA\Services\HeaderValidator;

defined('ABSPATH') or die();


class HtaccessWriter
{
    const MARKER = 'JEELSH HTTP Headers Advanced';

    /**
     * Escribe las cabeceras en .htaccess usando marcadores.
     *
     * @param array<string, string> $headers ['Header-Name' => 'value']
     * @return bool true si se escribió correctamente
     */
    public static function write(array $headers): bool
    {
        $path = ServerEnvironment::getHtaccessPath();

        // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_is_writable
        if (!\file_exists($path) || !\is_writable($path)) {
            return false;
        }

        $lines = [];

        $headers = HeaderValidator::sanitizeHeaders($headers);

        if (!empty($headers)) {
            $lines[] = '<IfModule mod_headers.c>';

            foreach ($headers as $name => $value) {
                $escaped = self::escapeApacheHeaderValue($value);
                $lines[] = '    Header set ' . $name . ' "' . $escaped . '"';
            }

            $lines[] = '</IfModule>';
        }

        return self::insertWithMarkers($path, self::MARKER, $lines);
    }

    /**
     * Escape a value to be safely used inside a double-quoted Apache
     * mod_headers directive.
     *
     * @param string $value
     * @return string
     */
    protected static function escapeApacheHeaderValue(string $value): string
    {
        return \addcslashes($value, '"\\');
    }

    /**
     * Elimina el bloque de cabeceras del .htaccess.
     *
     * @return bool
     */
    public static function remove(): bool
    {
        $path = ServerEnvironment::getHtaccessPath();

        // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_is_writable
        if (!\file_exists($path) || !\is_writable($path)) {
            return false;
        }

        return self::insertWithMarkers($path, self::MARKER, []);
    }

    /**
     * Inserta o reemplaza contenido entre marcadores en un archivo.
     * Similar a insert_with_markers() de WordPress pero sin dependencia de admin.
     *
     * @param string   $filename Ruta al archivo
     * @param string   $marker   Nombre del marcador
     * @param string[] $lines    Líneas a insertar (vacío para eliminar)
     * @return bool
     */
    protected static function insertWithMarkers(string $filename, string $marker, array $lines): bool
    {
        if (\function_exists('insert_with_markers')) {
            return \insert_with_markers($filename, $marker, $lines);
        }

        // Fallback manual si insert_with_markers no está disponible
        if (!\file_exists($filename)) {
            return false;
        }

        $content = \file_get_contents($filename);
        if ($content === false) {
            return false;
        }

        $startMarker = '# BEGIN ' . $marker;
        $endMarker   = '# END ' . $marker;

        // Eliminar bloque existente
        $pattern = '/' . \preg_quote($startMarker, '/') . '.*?' . \preg_quote($endMarker, '/') . '\s*/s';
        $content = \preg_replace($pattern, '', $content);

        // Añadir nuevo bloque si hay líneas
        if (!empty($lines)) {
            $block = $startMarker . "\n" . \implode("\n", $lines) . "\n" . $endMarker . "\n";
            $content = \rtrim($content) . "\n\n" . $block;
        }

        return \file_put_contents($filename, $content) !== false;
    }
}
