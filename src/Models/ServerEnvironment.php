<?php

namespace JEELSHHA\Models;

defined('ABSPATH') or die();


class ServerEnvironment
{
    /**
     * Detecta el tipo de servidor web.
     *
     * @return string 'apache'|'litespeed'|'nginx'|'iis'|'unknown'
     */
    public static function getServerType(): string
    {
        $software = isset($_SERVER['SERVER_SOFTWARE']) ? \sanitize_text_field(\wp_unslash($_SERVER['SERVER_SOFTWARE'])) : '';

        if (\stripos($software, 'LiteSpeed') !== false) {
            return 'litespeed';
        }

        if (\stripos($software, 'Apache') !== false) {
            return 'apache';
        }

        if (\stripos($software, 'nginx') !== false) {
            return 'nginx';
        }

        if (\stripos($software, 'Microsoft-IIS') !== false) {
            return 'iis';
        }

        return 'unknown';
    }

    /**
     * Devuelve la ruta al archivo .htaccess.
     */
    public static function getHtaccessPath(): string
    {
        if (\function_exists('get_home_path')) {
            return \get_home_path() . '.htaccess';
        }

        return ABSPATH . '.htaccess';
    }

    /**
     * Comprueba si se puede usar .htaccess para inyectar cabeceras.
     * Requiere Apache o LiteSpeed y que el archivo sea escribible.
     */
    public static function canUseHtaccess(): bool
    {
        $type = self::getServerType();

        if ($type !== 'apache' && $type !== 'litespeed') {
            return false;
        }

        $path = self::getHtaccessPath();

        if (!\file_exists($path)) {
            return false;
        }

        // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_is_writable
        return \is_writable($path);
    }

    /**
     * Comprueba si el .htaccess existe y es escribible (sin importar el servidor).
     */
    public static function isHtaccessWritable(): bool
    {
        $path = self::getHtaccessPath();

        // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_is_writable
        return \file_exists($path) && \is_writable($path);
    }
}
