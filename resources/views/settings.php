<?php

use JEELSHHA\Security;

if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

    <?php if (isset($_GET['saved']) && $_GET['saved'] === 'true') : ?>
        <div class="notice notice-success is-dismissible">
            <p><?php esc_html_e('Settings saved successfully.', 'http-headers-advanced'); ?></p>
        </div>
    <?php endif; ?>

    <form method="post" action="">
        <?php Security::nonce_field('http_headers_advanced_action', 'http_headers_advanced_nonce'); ?>

        <table class="form-table">
            <tr>
                <th scope="row"><?php esc_html_e('Enable advanced headers', 'http-headers-advanced'); ?></th>
                <td>
                    <label for="http_headers_advanced_enabled">
                        <input type="checkbox" id="http_headers_advanced_enabled" name="http_headers_advanced_enabled" value="1" <?php checked(1, $enabled); ?> />
                        <?php esc_html_e('Activate HTTP Headers Advanced management', 'http-headers-advanced'); ?>
                    </label>
                </td>
            </tr>
            <tr>
                <th scope="row">
                    <label for="http_headers_advanced_custom"><?php esc_html_e('Custom header', 'http-headers-advanced'); ?></label>
                </th>
                <td>
                    <input type="text" id="http_headers_advanced_custom" name="http_headers_advanced_custom" value="<?php echo esc_attr($custom_header); ?>" class="regular-text" placeholder="X-Custom-Header: value" />
                    <p class="description"><?php esc_html_e('Add a custom HTTP header value. Not used if empty.', 'http-headers-advanced'); ?></p>
                </td>
            </tr>
        </table>

        <?php submit_button(__('Save Changes', 'http-headers-advanced'), 'primary', 'submit_http_headers_advanced'); ?>
    </form>
</div>
