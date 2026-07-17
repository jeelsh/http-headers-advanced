<?php
namespace JEELSHHA;
/**
 * Plugin Name: HTTP Headers Advanced
 * Plugin URI: https://github.com/jeelsh/http-headers-advanced
 * Description: Advanced HTTP headers management for WordPress.
 * Version: 1.0.0
 * Author: Jeelsh
 * Author URI: https://github.com/jeelsh
 * License: GPL2+
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: http-headers-advanced
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 */

defined('ABSPATH') or die(exit());

if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    $loader = require __DIR__ . '/vendor/autoload.php';
    $antonella = new Start;
} else {
    add_action('admin_notices', function() {
        echo '<div class="notice notice-error"><p><strong>HTTP Headers Advanced:</strong> Dependencies missing. Please run <code>composer install</code> in the plugin directory.</p></div>';
    });
    return;
}


