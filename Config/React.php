<?php
/**
 * React Configuration
 * 
 * This file contains configuration for React integration in your WordPress plugin.
 * 
 * @package JEELSHHA
 */

return [
    /**
     * Unique key for this React app (used to namespace scripts and containers)
     * IMPORTANT: Each plugin must have a different app_key to avoid collisions
     */
    'app_key' => '04sewsgb',

    /**
     * Unique container ID for React root element
     * WARNING: If you change this, make sure it's unique across your entire WordPress installation
     * This ID is used in the DOM to mount the React application
     */
    'container_id' => '513c0ca4-8f79-406d-8e64-d8f6f5d0870e',

    /**
     * Application environment
     * 'develop' - Loads React from Vite dev server (HMR enabled)
     * 'production' - Loads from built assets
     */
    'app_env' => 'develop',

    /**
     * Vite development server URL
     * Used when app_env is 'develop'
     */
    'vite_server' => 'http://localhost:3000',

    /**
     * Build output directory (relative to plugin root)
     * Used when app_env is 'production'
     */
    'build_path' => 'assets/dist',

    /**
     * React entry point file
     */
    'entry_point' => 'resources/js/app.jsx',

    /**
     * Enqueue React scripts in admin area
     */
    'load_in_admin' => true,

    /**
     * Enqueue React scripts in frontend
     */
    'load_in_frontend' => true,

    /**
     * Script version (for cache busting)
     * Set to null to use plugin version or filemtime
     */
    'version' => null,

    /**
     * Enable CSS style isolation for the React container.
     * When true, a scoped CSS reset is injected to prevent WordPress/theme styles
     * from bleeding into the React component tree.
     * Set to false if you use a global CSS library (Tailwind, MUI, etc.)
     */
    'style_isolation' => false,

    /**
     * Style isolation mode.
     * 'reset'     - Applies `all: revert` + sensible base values. Maximum isolation.
     * 'normalize' - Applies only box-sizing, margin/padding reset and basic normalizations. Less aggressive.
     */
    'style_isolation_mode' => 'reset',
    
    /**
     * Global localize script
     */
    'global_localize_script' => [
        'HTTP_HEADERS_ADVANCED' => [
            'restUrl' => rest_url('http-headers-advanced/v1/admin'),
            'nonce' => wp_create_nonce('wp_rest'),
            'ajaxUrl' => admin_url('admin-ajax.php'),
        ]
    ],
];
