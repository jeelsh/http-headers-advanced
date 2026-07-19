<?php

namespace JEELSHHA\Controllers;

use JEELSHHA\Core\React;
use JEELSHHA\Models\Headers;
use JEELSHHA\Services\HeaderDispatcher;
use JEELSHHA\Services\HeaderValidator;
use JEELSHHA\Services\RestSecurity;

defined('ABSPATH') or die();


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
     * Register REST API routes.
     */
    public static function registerRoutes()
    {
        \register_rest_route('http-headers-advanced/v1', '/settings', [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [__CLASS__, 'getSettings'],
                'permission_callback' => [__CLASS__, 'permissionCheck'],
            ],
            [
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => [__CLASS__, 'saveSettings'],
                'permission_callback' => [__CLASS__, 'permissionCheck'],
            ],
        ]);
    }

    /**
     * Permission callback: admins with a valid REST nonce.
     */
    public static function permissionCheck(\WP_REST_Request $request)
    {
        return RestSecurity::adminPermissionCheck($request);
    }

    /**
     * GET /settings – Return all header settings.
     */
    public static function getSettings(\WP_REST_Request $request)
    {
        $headers = Headers::load();
        return new \WP_REST_Response($headers->toArray(), 200);
    }

    /**
     * POST /settings – Save header settings.
     */
    public static function saveSettings(\WP_REST_Request $request)
    {
        $data = $request->get_json_params();

        if (empty($data) || !\is_array($data)) {
            return new \WP_REST_Response(['message' => \__('No data provided.', 'http-headers-advanced')], 400);
        }

        try {
            $data = HeaderValidator::validateSettings($data);
        } catch (\InvalidArgumentException $e) {
            return new \WP_REST_Response(['message' => $e->getMessage()], 400);
        }

        $headers = Headers::load();
        $headers->fill($data)->save();

        HeaderDispatcher::apply();

        return new \WP_REST_Response([
            'message'  => \__('Settings saved successfully.', 'http-headers-advanced'),
            'settings' => $headers->toArray(),
        ], 200);
    }

    /**
     * Render the React settings page.
     */
    public static function settingsPage()
    {
        if (!\current_user_can('manage_options')) {
            \wp_die(\esc_html(\__('You do not have sufficient permissions to access this page.', 'http-headers-advanced')));
        }

        $assetBaseUrl = self::assetBaseUrl();

        $pageData = [
            'title'        => \__('HTTP Headers Advanced', 'http-headers-advanced'),
            'message'      => \__('Manage advanced HTTP headers for your WordPress site.', 'http-headers-advanced'),
            'assetBaseUrl' => $assetBaseUrl,
        ];

        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        echo React::render('AdminPanel', $pageData);
    }

    /**
     * Resolve the correct base URL for public assets depending on environment.
     */
    protected static function assetBaseUrl()
    {
        $appEnv = React::getConfig('app_env', 'production');

        if ($appEnv === 'develop') {
            return \rtrim(React::getConfig('vite_server', 'http://localhost:3000'), '/');
        }

        $pluginUrl = \plugin_dir_url(\dirname(\dirname(__DIR__)) . '/http-headers-advanced.php');
        $buildPath = React::getConfig('build_path', 'assets/dist');

        return \rtrim($pluginUrl . $buildPath, '/');
    }
}
