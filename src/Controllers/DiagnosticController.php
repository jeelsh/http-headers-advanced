<?php

namespace JEELSHHA\Controllers;

use JEELSHHA\Models\Diagnostic;
use JEELSHHA\Services\RestSecurity;

class DiagnosticController
{
    /**
     * Register REST API routes.
     */
    public static function registerRoutes()
    {
        \register_rest_route('http-headers-advanced/v1', '/diagnostics', [
            'methods'             => \WP_REST_Server::READABLE,
            'callback'            => [__CLASS__, 'getDiagnostics'],
            'permission_callback' => [__CLASS__, 'permissionCheck'],
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
     * GET /diagnostics – Return diagnostic information.
     */
    public static function getDiagnostics(\WP_REST_Request $request)
    {
        return new \WP_REST_Response(Diagnostic::collect(), 200);
    }
}
