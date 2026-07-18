<?php

namespace JEELSHHA\Models;

class Diagnostic
{
    /**
     * Recopila toda la información de diagnóstico.
     *
     * @return array{environment: array, summary: array, configured_headers: array}
     */
    public static function collect(): array
    {
        $headers = Headers::load();

        return [
            'environment'        => self::environment(),
            'summary'            => self::summary($headers),
            'configured_headers' => self::configuredHeaders($headers),
        ];
    }

    /**
     * Información del entorno del servidor.
     */
    protected static function environment(): array
    {
        $serverSoftware = $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown';

        return [
            'site_url'        => \get_site_url(),
            'is_https'        => \is_ssl(),
            'server_software' => $serverSoftware,
            'is_apache'       => \stripos($serverSoftware, 'Apache') !== false,
            'is_nginx'        => \stripos($serverSoftware, 'nginx') !== false,
            'php_version'     => \phpversion(),
            'wp_version'      => \get_bloginfo('version'),
        ];
    }

    /**
     * Resumen de la configuración activa.
     */
    protected static function summary(Headers $headers): array
    {
        $built = $headers->buildHeaders();

        // CSP mode
        $cspMode = 'Disabled';
        if ($headers->get('csp_enabled')) {
            $cspMode = $headers->get('csp_report_only') ? 'Report-Only' : 'Enforce';
        }

        // Source detection
        $cspSourceDetection = 'Manual';
        if ($headers->get('csp_auto_detect')) {
            $cspSourceDetection = 'Automatic';
        }

        return [
            'configured_headers_count' => \count($built),
            'csp_mode'                 => $cspMode,
            'csp_fail_safe'            => $headers->get('csp_emergency_failsafe'),
            'csp_source_detection'     => $cspSourceDetection,
            'csp_report_collector'     => $headers->get('csp_report_collector'),
        ];
    }

    /**
     * Cabeceras HTTP configuradas como array de {name, value}.
     */
    protected static function configuredHeaders(Headers $headers): array
    {
        $built = $headers->buildHeaders();
        $result = [];

        foreach ($built as $name => $value) {
            $result[] = [
                'name'  => $name,
                'value' => $value,
            ];
        }

        return $result;
    }
}
