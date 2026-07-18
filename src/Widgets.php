<?php

namespace JEELSHHA;

use JEELSHHA\Config;

defined('ABSPATH') or die();


class Widgets
{
    public function __construct()
    {
    }

    public static function index()
    {
        $config = new Config();
        $filter = $config->widgets;
        // add_shortcode('example', array('Shortcodes','example_function'));
        if (is_array($filter) && count($filter) > 0) {
            foreach ($filter as $data) {
                \register_widget($data);
            }
        }
    }
}
