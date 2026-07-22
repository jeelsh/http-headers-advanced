=== HTTP Headers Advanced ===
Contributors: jeelshy
Tags: http headers, security headers, csp, hsts, wordpress security
Requires at least: 5.0
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Configure advanced HTTP security headers for your WordPress site.

== Description ==

HTTP Headers Advanced provides an intuitive interface to configure HTTP response headers directly from your WordPress dashboard, helping you improve your site's security posture and compliance.

= Key Features =
* Easily configure Content-Security-Policy (CSP) headers.
* Implement HTTP Strict Transport Security (HSTS).
* Set Referrer-Policy, X-Frame-Options, and Permissions-Policy.
* Add your own custom HTTP headers.

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/jeelsh-http-headers` directory, or install the plugin through the WordPress Plugins screen.
2. Activate the plugin through the Plugins screen in WordPress.
3. Open HTTP Headers Advanced from the WordPress administration menu to configure your headers.

== Frequently Asked Questions ==

= Is the plugin GPL-compatible? =

Yes. HTTP Headers Advanced is licensed under the GNU General Public License v2.0 or later.

= Does the plugin require a third-party service? =

No, not by default. Header configuration and validation run within your WordPress installation. For details on optional connections, development tools, and source code, see the External Services and Source Code sections below.

== External Services ==

This plugin does not connect to any third-party service by default. The following items are documented for transparency:

* Vite development server: When the plugin is in development mode (configurable in Config/React.php as 'develop'), it loads JavaScript modules and HMR WebSocket messages from the configured local Vite server (default http://localhost:3000). No user data is transmitted. This connection is only active when a developer explicitly enables development mode and runs the Vite server locally.

* CSP report-uri: If you configure a report-uri in the CSP settings, the browser will send CSP violation reports to the user-provided URL. The plugin does not provide or operate that endpoint; the site administrator chooses and controls it. By default the report-uri field is empty and no reports are sent.

* Example domains in settings fields: Inputs such as https://example.com and https://api.example.com use IANA-reserved example domains as placeholders only. The plugin does not connect to them.

* GitHub documentation link: The admin sidebar includes a link to https://github.com/jeelsh/http-headers-advanced. It opens only when a user clicks it. GitHub is operated by GitHub, Inc.; for terms and privacy, see https://docs.github.com/en/site-policy/github-terms/github-terms-of-service and https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement.

* Support email link: The admin sidebar includes a mailto:jeelsh@protonmail.com link. It opens the user's email client; the plugin does not send any data.

* WordPress REST API and admin-ajax: Saving and validating settings uses the site's own WordPress REST API endpoints and admin-ajax.php. These are same-site, internal communications.

== Source Code ==

The plugin's user interface is built with React. The compiled, production-ready files are in assets/dist/. The human-readable source code and build tooling are maintained at https://github.com/jeelsh/http-headers-advanced.

To review or rebuild the JavaScript and CSS from source, clone the repository and run:

    npm install
    npm run build

For end users, the plugin works out of the box with the pre-built assets in assets/dist/.

== Changelog ==

= 1.0.0 =

* Initial release.