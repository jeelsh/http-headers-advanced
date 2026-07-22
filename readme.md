# HTTP Headers Advanced

Advanced HTTP headers management for WordPress. This plugin provides a flexible, developer-friendly way to configure and manage HTTP response headers directly from your WordPress installation, helping improve security, caching, and overall site performance.

## Description

HTTP Headers Advanced is a WordPress plugin built on top of the Antonella Framework. It allows developers and site administrators to customize HTTP response headers with a clean, MVC-based architecture. The plugin is designed to be extensible, secure, and easy to maintain.

## Requirements

- PHP 7.4 or higher
- WordPress 5.0 or higher
- Composer (for dependency management)

## Installation

1. Clone or download the plugin into your WordPress `wp-content/plugins/` directory.
2. Run `composer install` inside the plugin folder.
3. Activate the plugin through the WordPress admin panel.

## External Services

This plugin does not connect to any third-party service by default. The following items are documented for transparency:

- **Vite development server:** When the plugin is in development mode (configurable in `Config/React.php` as `'develop'`), it loads JavaScript modules and HMR WebSocket messages from the configured local Vite server (default `http://localhost:3000`). No user data is transmitted. This connection is only active when a developer explicitly enables development mode and runs the Vite server locally.

- **CSP report-uri:** If you configure a `report-uri` in the CSP settings, the browser will send CSP violation reports to the user-provided URL. The plugin does not provide or operate that endpoint; the site administrator chooses and controls it. By default the `report-uri` field is empty and no reports are sent.

- **Example domains in settings fields:** Inputs such as `https://example.com` and `https://api.example.com` use IANA-reserved example domains as placeholders only. The plugin does not connect to them.

- **GitHub documentation link:** The admin sidebar includes a link to [https://github.com/jeelsh/http-headers-advanced](https://github.com/jeelsh/http-headers-advanced). It opens only when a user clicks it. GitHub is operated by GitHub, Inc.; for terms and privacy, see [GitHub Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service) and [GitHub Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement).

- **Support email link:** The admin sidebar includes a `mailto:jeelsh@protonmail.com` link. It opens the user's email client; the plugin does not send any data.

- **WordPress REST API and admin-ajax:** Saving and validating settings uses the site's own WordPress REST API endpoints and `admin-ajax.php`. These are same-site, internal communications.

## Source Code

The plugin's user interface is built with React. The compiled, production-ready files are in `assets/dist/`. The human-readable source code and build tooling are maintained at [https://github.com/jeelsh/http-headers-advanced](https://github.com/jeelsh/http-headers-advanced).

To review or rebuild the JavaScript and CSS from source, clone the repository and run:

```bash
npm install
npm run build
```

For end users, the plugin works out of the box with the pre-built assets in `assets/dist/`.

## License

This project is licensed under the GPL2+ license. See the [license](https://www.gnu.org/licenses/gpl-2.0.html) for more details.
