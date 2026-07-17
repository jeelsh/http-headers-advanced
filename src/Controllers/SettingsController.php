<?php

namespace JEELSHHA\Controllers;

use JEELSHHA\Core\React;

class SettingsController
{
    /**
     * Share global data with the React app.
     */
    public static function boot()
    {
        React::share([
            'user' => [
                'name' => \wp_get_current_user()->display_name,
                'email' => \wp_get_current_user()->user_email,
            ],
            'site' => [
                'name' => \get_bloginfo('name'),
                'url' => \get_site_url(),
            ],
        ]);
    }

    /**
     * Render the React settings page.
     */
    public static function settingsPage()
    {
        if (!\current_user_can('manage_options')) {
            \wp_die(\esc_html(\__('You do not have sufficient permissions to access this page.', 'http-headers-advanced')));
        }

        $pageData = [
            'title' => \__('HTTP Headers Advanced', 'http-headers-advanced'),
            'message' => \__('Manage advanced HTTP headers for your WordPress site.', 'http-headers-advanced'),
            'enabled' => (bool) \get_option('http_headers_advanced_enabled', 0),
            'customHeader' => \get_option('http_headers_advanced_custom_header', ''),
        ];

        echo React::render('Settings', $pageData);
    }
}
