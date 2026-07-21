<?php

namespace JEELSHHA\Services;

defined('ABSPATH') or die();

class RestSecurity
{
    /**
     * Verify the X-WP-Nonce header against a given nonce action.
     *
     * @param \WP_REST_Request $request
     * @param string $action
     * @return true|\WP_Error
     */
    public static function verifyNonce(\WP_REST_Request $request, string $action = 'wp_rest')
    {
        $nonce = $request->get_header('X-WP-Nonce');

        if (empty($nonce) || !\wp_verify_nonce($nonce, $action)) {
            return new \WP_Error(
                'rest_forbidden',
                \__('Invalid or missing nonce. Please refresh the page.', 'jeelsh-http-headers'),
                ['status' => 403]
            );
        }

        return true;
    }

    /**
     * Permission callback for admin-only REST endpoints.
     *
     * @param \WP_REST_Request $request
     * @return true|\WP_Error
     */
    public static function adminPermissionCheck(\WP_REST_Request $request)
    {
        if (!\current_user_can('manage_options')) {
            return new \WP_Error(
                'rest_forbidden',
                \__('You do not have permission to perform this action.', 'jeelsh-http-headers'),
                ['status' => 403]
            );
        }

        return self::verifyNonce($request, 'wp_rest');
    }
}
