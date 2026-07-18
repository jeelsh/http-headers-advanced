<?php

namespace JEELSHHA\Controllers;

use JEELSHHA\Models\Tools;

class ToolsController
{
    /**
     * Register REST API routes.
     */
    public static function registerRoutes()
    {
        \register_rest_route('http-headers-advanced/v1', '/tools/export', [
            'methods'             => \WP_REST_Server::READABLE,
            'callback'            => [__CLASS__, 'exportSettings'],
            'permission_callback' => [__CLASS__, 'permissionCheck'],
        ]);

        \register_rest_route('http-headers-advanced/v1', '/tools/import', [
            'methods'             => \WP_REST_Server::CREATABLE,
            'callback'            => [__CLASS__, 'importSettings'],
            'permission_callback' => [__CLASS__, 'permissionCheck'],
        ]);

        \register_rest_route('http-headers-advanced/v1', '/tools/reset', [
            'methods'             => \WP_REST_Server::CREATABLE,
            'callback'            => [__CLASS__, 'resetSettings'],
            'permission_callback' => [__CLASS__, 'permissionCheck'],
        ]);
    }

    /**
     * Permission callback: only admins.
     */
    public static function permissionCheck(\WP_REST_Request $request)
    {
        return \current_user_can('manage_options');
    }

    /**
     * GET /tools/export – Export all settings as JSON.
     */
    public static function exportSettings(\WP_REST_Request $request)
    {
        return new \WP_REST_Response(Tools::export(), 200);
    }

    /**
     * POST /tools/import – Validate and import settings from JSON.
     */
    public static function importSettings(\WP_REST_Request $request)
    {
        $data = $request->get_json_params();

        if (empty($data) || !\is_array($data)) {
            return new \WP_REST_Response(['message' => 'No data provided.'], 400);
        }

        $validation = Tools::validate($data);

        if (!$validation['valid']) {
            return new \WP_REST_Response([
                'message' => 'Validation failed.',
                'errors'  => $validation['errors'],
            ], 422);
        }

        Tools::import($data['settings']);

        return new \WP_REST_Response([
            'message' => 'Settings imported successfully.',
        ], 200);
    }

    /**
     * POST /tools/reset – Reset all settings to defaults.
     */
    public static function resetSettings(\WP_REST_Request $request)
    {
        Tools::reset();

        return new \WP_REST_Response([
            'message' => 'Settings reset to defaults.',
        ], 200);
    }
}
