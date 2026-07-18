<?php

namespace JEELSHHA\Models;

use JEELSHHA\Services\HeaderValidator;

defined('ABSPATH') or die();


class Headers
{
    /**
     * Prefijo para las claves en wp_options.
     */
    protected string $prefix = 'http_headers_advanced_';

    /**
     * Campos modificados pendientes de guardar.
     */
    protected array $dirty = [];

    /**
     * Cache de valores cargados.
     */
    protected array $attributes = [];

    /**
     * Esquema: nombre del campo => valor por defecto.
     */
    protected static array $schema = [
        // HSTS
        'hsts_enabled'              => true,
        'hsts_max_age'              => 31536000,
        'hsts_include_subdomains'   => true,
        'hsts_preload'              => false,

        // X-Content-Type-Options
        'xcto_nosniff'              => true,

        // Referrer-Policy
        'referrer_policy_enabled'   => true,
        'referrer_policy_value'     => 'strict-origin-when-cross-origin',

        // X-Frame-Options
        'xfo_enabled'               => true,
        'xfo_value'                 => 'SAMEORIGIN',

        // Permissions-Policy
        'permissions_policy_enabled' => true,
        'permissions_policy_value'   => 'accelerometer=(), autoplay=(), camera=(), geolocation=(self), gyroscope=(), microphone=(), payment=()',

        // X-Permitted-Cross-Domain-Policies
        'xpcdp_enabled'             => true,
        'xpcdp_value'               => 'none',

        // CSP – general
        'csp_enabled'               => false,
        'csp_report_only'           => true,
        'csp_emergency_failsafe'    => true,
        'csp_auto_detect'           => true,
        'csp_report_collector'      => true,

        // CSP – directivas
        'csp_default_src'           => "'self'",
        'csp_script_src'            => "'self' 'unsafe-inline' 'unsafe-eval'",
        'csp_style_src'             => "'self' 'unsafe-inline'",
        'csp_img_src'               => "'self' data: https:",
        'csp_connect_src'           => "'self'",
        'csp_font_src'              => "'self' data: https:",
        'csp_object_src'            => "'none'",
        'csp_base_uri'              => "'self'",
        'csp_frame_ancestors'       => "'self'",
        'csp_form_action'           => "'self'",
        'csp_report_uri'            => '',
        'csp_upgrade_insecure'      => false,
    ];

    /**
     * Carga todos los campos desde wp_options y devuelve una instancia.
     */
    public static function load(): self
    {
        $instance = new self();

        foreach (static::$schema as $key => $default) {
            $raw = \get_option($instance->prefix . $key, null);

            if ($raw === null) {
                $instance->attributes[$key] = $default;
            } else {
                $instance->attributes[$key] = $instance->cast($key, $raw);
            }
        }

        return $instance;
    }

    /**
     * Obtiene el valor de un campo.
     */
    public function get(string $key): mixed
    {
        if (!\array_key_exists($key, static::$schema)) {
            return null;
        }

        return $this->attributes[$key] ?? static::$schema[$key];
    }

    /**
     * Establece el valor de un campo y lo marca como dirty.
     */
    public function set(string $key, mixed $value): self
    {
        if (!\array_key_exists($key, static::$schema)) {
            return $this;
        }

        $this->attributes[$key] = $value;
        $this->dirty[$key] = true;

        return $this;
    }

    /**
     * Set masivo: filtra solo claves válidas del schema.
     */
    public function fill(array $data): self
    {
        foreach ($data as $key => $value) {
            $this->set($key, $value);
        }

        return $this;
    }

    /**
     * Guarda en wp_options solo los campos modificados.
     */
    public function save(): void
    {
        foreach ($this->dirty as $key => $flag) {
            $value = $this->attributes[$key];

            if (\is_bool($value)) {
                $value = $value ? '1' : '0';
            }

            \update_option($this->prefix . $key, $value);
        }

        $this->dirty = [];
    }

    /**
     * Exporta todos los atributos como array asociativo (sin prefijo).
     */
    public function toArray(): array
    {
        $result = [];

        foreach (static::$schema as $key => $default) {
            $result[$key] = $this->attributes[$key] ?? $default;
        }

        return $result;
    }

    /**
     * Genera las cabeceras HTTP resultantes según la configuración actual.
     *
     * @return array<string, string>  ['Header-Name' => 'value']
     */
    public function buildHeaders(): array
    {
        $result = [];

        // HSTS
        if ($this->get('hsts_enabled')) {
            $value = 'max-age=' . $this->get('hsts_max_age');
            if ($this->get('hsts_include_subdomains')) {
                $value .= '; includeSubDomains';
            }
            if ($this->get('hsts_preload')) {
                $value .= '; preload';
            }
            $result['Strict-Transport-Security'] = $value;
        }

        // X-Content-Type-Options
        if ($this->get('xcto_nosniff')) {
            $result['X-Content-Type-Options'] = 'nosniff';
        }

        // Referrer-Policy
        if ($this->get('referrer_policy_enabled')) {
            $result['Referrer-Policy'] = $this->get('referrer_policy_value');
        }

        // X-Frame-Options
        if ($this->get('xfo_enabled')) {
            $result['X-Frame-Options'] = $this->get('xfo_value');
        }

        // Permissions-Policy
        if ($this->get('permissions_policy_enabled')) {
            $result['Permissions-Policy'] = $this->get('permissions_policy_value');
        }

        // X-Permitted-Cross-Domain-Policies
        if ($this->get('xpcdp_enabled')) {
            $result['X-Permitted-Cross-Domain-Policies'] = $this->get('xpcdp_value');
        }

        // Content-Security-Policy
        if ($this->get('csp_enabled')) {
            $directives = [];

            $cspKeys = [
                'csp_default_src'    => 'default-src',
                'csp_script_src'     => 'script-src',
                'csp_style_src'      => 'style-src',
                'csp_img_src'        => 'img-src',
                'csp_connect_src'    => 'connect-src',
                'csp_font_src'       => 'font-src',
                'csp_object_src'     => 'object-src',
                'csp_base_uri'       => 'base-uri',
                'csp_frame_ancestors' => 'frame-ancestors',
                'csp_form_action'    => 'form-action',
            ];

            foreach ($cspKeys as $key => $directive) {
                $val = \trim((string) $this->get($key));
                $val = \preg_replace('/\s+/', ' ', $val);
                if ($val !== '') {
                    $directives[] = $directive . ' ' . $val;
                }
            }

            $reportUri = \trim((string) $this->get('csp_report_uri'));
            if ($reportUri !== '' && HeaderValidator::isValidReportUri($reportUri)) {
                $directives[] = 'report-uri ' . $reportUri;
            }

            if ($this->get('csp_upgrade_insecure')) {
                $directives[] = 'upgrade-insecure-requests';
            }

            $headerName = $this->get('csp_report_only')
                ? 'Content-Security-Policy-Report-Only'
                : 'Content-Security-Policy';

            $result[$headerName] = \implode('; ', $directives);
        }

        return $result;
    }

    /**
     * Restaura todos los atributos a los valores por defecto del schema.
     */
    public function resetToDefaults(): self
    {
        foreach (static::$schema as $key => $default) {
            $this->attributes[$key] = $default;
            $this->dirty[$key] = true;
        }

        return $this;
    }

    /**
     * Devuelve el esquema con los valores por defecto.
     */
    public static function schema(): array
    {
        return static::$schema;
    }

    /**
     * Getter mágico: $headers->hsts_enabled
     */
    public function __get(string $name): mixed
    {
        return $this->get($name);
    }

    /**
     * Setter mágico: $headers->hsts_enabled = false
     */
    public function __set(string $name, mixed $value): void
    {
        $this->set($name, $value);
    }

    /**
     * Castea el valor leído de wp_options al tipo correcto según el default del schema.
     */
    protected function cast(string $key, mixed $raw): mixed
    {
        $default = static::$schema[$key] ?? null;

        if (\is_bool($default)) {
            return \filter_var($raw, FILTER_VALIDATE_BOOLEAN);
        }

        if (\is_int($default)) {
            return (int) $raw;
        }

        return (string) $raw;
    }
}
