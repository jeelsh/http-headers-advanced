<?php

/**
 * No modify this file !!!
 */

namespace JEELSHHA;

use JEELSHHA\Config;

defined('ABSPATH') or die();


class Request
{
    public $post_data = array();
    public $get_data = array();
    /**
     * Index function
     * Create the process data
     * @return void
     */
    public function __construct()
    {
        $config = new Config();
        $this->process($config->post);
        $this->process($config->get);
    }

    /**
     * Verify nonce for security
     * @param $nonce_name string The name of the nonce field
     * @param $action string The action name for the nonce
     * @return void
     */
    public function verify_nonce($nonce_name, $action)
    {
        // Sanitize and unslash POST data before verification
        $nonce_value = isset($_POST[$nonce_name]) ? sanitize_text_field(wp_unslash($_POST[$nonce_name])) : '';
        
        if (empty($nonce_value) || !wp_verify_nonce($nonce_value, $action)) {
            die(esc_html(__('Security check failed', 'http-headers-advanced')));
        }
    }

    /**
     * process function
     * process the request input (POST and GET)
     * @param [type] $datas the config array (post and get)
     * @return void
     */
    public function process($datas)
    {
        require_once(ABSPATH . 'wp-includes/pluggable.php');

        foreach ($datas as $key => $data) {
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            if (!isset($_REQUEST[$key])) {
                continue;
            }

            if ($this->isPost()) {
                $this->verify_nonce('http_headers_advanced_nonce', 'http_headers_advanced_action');
            }

            if (!$this->isAllowedCallback($data)) {
                continue;
            }

            // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
            $raw = \is_array($_REQUEST[$key]) ? '' : \sanitize_text_field(\wp_unslash($_REQUEST[$key]));
            $sanitized_value = $raw;
            call_user_func_array($data, [$sanitized_value]);
        }
    }

    /**
     * Check if the current request method is POST.
     *
     * @return bool
     */
    protected function isPost(): bool
    {
        $method = isset($_SERVER['REQUEST_METHOD']) ? \sanitize_text_field(\wp_unslash($_SERVER['REQUEST_METHOD'])) : '';
        return \strtoupper($method) === 'POST';
    }

    /**
     * Allow only static callbacks from the Controllers namespace.
     *
     * @param mixed $callback
     * @return bool
     */
    protected function isAllowedCallback($callback): bool
    {
        $callableName = '';

        if (!\is_callable($callback, false, $callableName)) {
            return false;
        }

        return \strpos($callableName, 'JEELSHHA\\Controllers\\') === 0;
    }
}
