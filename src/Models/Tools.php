<?php

namespace JEELSHHA\Models;

use JEELSHHA\Services\HeaderDispatcher;

defined('ABSPATH') or die();


class Tools
{
    const PLUGIN_SLUG = 'jeelsh-http-headers';
    const PLUGIN_VERSION = '1.0.0';

    /**
     * Exporta la configuración completa con metadata.
     */
    public static function export(): array
    {
        $headers = Headers::load();

        return [
            'plugin'      => self::PLUGIN_SLUG,
            'version'     => self::PLUGIN_VERSION,
            'exported_at' => \gmdate('c'),
            'site_url'    => \get_site_url(),
            'settings'    => $headers->toArray(),
        ];
    }

    /**
     * Valida la estructura del JSON importado.
     *
     * @param array $data Datos parseados del JSON
     * @return array{valid: bool, errors: string[]}
     */
    public static function validate(array $data): array
    {
        $errors = [];

        if (empty($data['plugin']) || $data['plugin'] !== self::PLUGIN_SLUG) {
            $errors[] = 'Invalid or missing "plugin" field. Expected "' . self::PLUGIN_SLUG . '".';
        }

        if (!isset($data['settings']) || !\is_array($data['settings'])) {
            $errors[] = 'Missing or invalid "settings" field.';
            return ['valid' => false, 'errors' => $errors];
        }

        $schema = Headers::schema();
        $unknownKeys = \array_diff_key($data['settings'], $schema);

        if (!empty($unknownKeys)) {
            $errors[] = 'Unknown settings keys: ' . \implode(', ', \array_keys($unknownKeys));
        }

        $validKeys = \array_intersect_key($data['settings'], $schema);

        if (empty($validKeys)) {
            $errors[] = 'No valid settings keys found.';
        }

        return [
            'valid'      => empty($errors),
            'errors'     => $errors,
            'valid_keys' => \count($validKeys),
            'total_keys' => \count($data['settings']),
        ];
    }

    /**
     * Importa la configuración desde un array de settings.
     */
    public static function import(array $settings): void
    {
        $headers = Headers::load();
        $headers->fill($settings)->save();
        HeaderDispatcher::apply();
    }

    /**
     * Resetea la configuración a los valores por defecto.
     */
    public static function reset(): void
    {
        $headers = Headers::load();
        $headers->resetToDefaults()->save();
        HeaderDispatcher::apply();
    }
}
