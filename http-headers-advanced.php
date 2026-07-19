<?php
namespace JEELSHHA;
/**
 * Plugin Name:       HTTP Headers Advanced
 * Plugin URI:        https://github.com/jeelsh/http-headers-advanced
 * Description:       Configure and manage HTTP security headers, including CSP, HSTS, Referrer-Policy, X-Frame-Options, and Permissions-Policy, from WordPress.
 * Version:           1.0.0
 * Author:            Jeelsh
 * Author URI:        https://github.com/jeelsh
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       http-headers-advanced
 * Domain Path:       /languages
 * Requires at least: 5.0
 * Tested up to:      7.0
 * Requires PHP:      7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter('plugin_action_links_' . plugin_basename(__FILE__), function ($links) {
    $settings_url = admin_url('options-general.php?page=http-headers-advanced');
    $settings_link = '<a href="' . esc_url($settings_url) . '">' . esc_html__('Settings', 'http-headers-advanced') . '</a>';

    array_unshift($links, $settings_link);

    return $links;
});

if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require __DIR__ . '/vendor/autoload.php';
    new Start;
} else {
    add_action('admin_notices', function() {
        echo '<div class="notice notice-error"><p><strong>HTTP Headers Advanced:</strong> Dependencies missing. Please run <code>composer install</code> in the plugin directory.</p></div>';
    });
    return;
}


