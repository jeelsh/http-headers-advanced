<?php

namespace JEELSHHA;

use JEELSHHA\Config;

defined('ABSPATH') or die();


class Language
{
    private $config;
    private $textdomain;
    private $languages_path;

    public function __construct()
    {
        $this->config = new Config();
        $this->textdomain = $this->config->language_name;
        $this->languages_path = dirname(plugin_basename(__DIR__)) . '/languages/';
    }

    public static function init_translations()
    {
        $config = new Config();
        $locale = determine_locale();
        $languages_dir = dirname(__DIR__) . '/languages/';
        $mofile = $languages_dir . $config->language_name . '-' . $locale . '.mo';

        if (!is_readable($mofile)) {
            $fallback_locale = 'es' === $locale || 0 === strpos($locale, 'es_') ? 'es_ES' : 'en_US';
            $mofile = $languages_dir . $config->language_name . '-' . $fallback_locale . '.mo';
        }

        if (is_readable($mofile)) {
            load_textdomain($config->language_name, $mofile);
        }

        load_plugin_textdomain(
            $config->language_name,
            false,
            dirname(plugin_basename(__DIR__)) . '/languages/'
        );

        add_filter('pre_load_script_translations', [self::class, 'fallback_script_translations'], 10, 4);
    }

    public static function fallback_script_translations($translations, $file, $handle, $domain)
    {
        if (
            null !== $translations
            || false !== $file
            || 'jeelsh-http-headers' !== $domain
            || 'antonella-react-app-' . \JEELSHHA\Core\React::getConfig('app_key') !== $handle
        ) {
            return $translations;
        }

        $locale = determine_locale();
        $fallback_locale = 'es' === $locale || 0 === strpos($locale, 'es_') ? 'es_ES' : 'en_US';
        $fallback = dirname(__DIR__) . '/languages/' . $domain . '-' . $fallback_locale . '-' . $handle . '.json';

        return is_readable($fallback) ? file_get_contents($fallback) : $translations;
    }

    /**
     * Get the current textdomain
     * @return string
     */
    public function get_textdomain()
    {
        return $this->textdomain;
    }

    /**
     * Get the languages directory path
     * @return string
     */
    public function get_languages_path()
    {
        return $this->languages_path;
    }
}
