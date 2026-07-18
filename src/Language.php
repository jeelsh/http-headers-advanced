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

        load_plugin_textdomain(
            $config->language_name,
            false,
            dirname(plugin_basename(__DIR__)) . '/languages/'
        );
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
