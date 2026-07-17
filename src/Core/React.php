<?php

namespace JEELSHHA\Core;

use Closure;

/**
 * React Component Renderer
 * 
 * Inspired by Inertia.js WordPress adapter architecture
 * Provides a clean API to render React components from WordPress templates
 * 
 * @package JEELSHHA\Core
 */
class React
{
    protected static $config = null;
    protected static $component = null;
    protected static $props = [];
    protected static $sharedProps = [];
    protected static $rootView = 'app.php';
    protected static $version = null;
    protected static $pageData = null;
    protected static $manifest = null;
    protected static $assetsEnqueued = false;
    protected static $bootedControllers = [];
    protected static $renderIndex = 0;
    protected static $currentContainerId = null;
    

    /**
     * Render a React component
     * 
     * @param string $component Component name
     * @param array $props Component props
     * @return string HTML output
     */
    public static function render(string $component, array $props = [])
    {
        self::loadConfig();
        self::bootController();
        self::setComponent($component);
        self::setProps($props);
        
        self::$pageData = [
            'component' => self::$component,
            'props' => self::$props,
            'version' => self::$version,
            'url' => self::getCurrentUrl(),
        ];

        self::$currentContainerId = self::nextContainerId();
        self::enqueueScripts();

        ob_start();
        self::renderDefaultTemplate();
        return ob_get_clean();
    }

    protected static function bootController()
    {
        $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 3);

        foreach ($trace as $frame) {
            if (!isset($frame['class']) || $frame['class'] === __CLASS__) {
                continue;
            }

            $controllerClass = $frame['class'];

            if (in_array($controllerClass, self::$bootedControllers, true)) {
                return;
            }

            if (method_exists($controllerClass, 'boot')) {
                self::$bootedControllers[] = $controllerClass;
                $controllerClass::boot();
            }

            return;
        }
    }

    public static function setRootView(string $name)
    {
        self::$rootView = $name;
    }

    public static function version(string $version)
    {
        self::$version = $version;
    }

    public static function share($key, $value = null)
    {
        if (is_array($key)) {
            self::$sharedProps = array_merge(self::$sharedProps, $key);
        } else {
            self::$sharedProps[$key] = $value;
        }
    }

    public static function lazy(callable $callback)
    {
        return new LazyProp($callback);
    }

    public static function inject()
    {
        if (self::$pageData === null) {
            return;
        }

        $containerId = self::$currentContainerId ?? self::getConfig('container_id', 'antonella-react-root');
        $dataJson = htmlspecialchars(json_encode(self::$pageData), ENT_QUOTES, 'UTF-8');
        $componentName = self::$component ?? '';
        $propsJson = htmlspecialchars(json_encode(self::$props), ENT_QUOTES, 'UTF-8');
        $appKey = self::getAppKey();
        
        echo sprintf(
            '<div id="%s" class="antonella-react-root" data-antonella-react="%s" data-component="%s" data-props="%s" data-page="%s"></div>',
            esc_attr($containerId),
            esc_attr($appKey),
            esc_attr($componentName),
            $propsJson,
            $dataJson
        );
    }

    public static function enqueueScripts()
    {
        if (self::$assetsEnqueued) {
            return;
        }

        self::loadConfig();
        
        $isDev = self::getConfig('app_env', 'production') === 'develop';
        
        if ($isDev) {
            self::enqueueDevScripts();
        } else {
            if (!self::validateProductionAssets()) {
                self::showAssetsError();
                return;
            }
            self::enqueueProductionScripts();
        }

        add_filter('script_loader_tag', [__CLASS__, 'addModuleType'], 999, 2);

        self::$assetsEnqueued = true;
    }

    public static function getConfig(string $key, $default = null)
    {
        self::loadConfig();
        return self::$config[$key] ?? $default;
    }

    protected static function loadConfig()
    {
        if (self::$config !== null) {
            return;
        }

        $configPath = dirname(dirname(__DIR__)) . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'React.php';
        
        if (file_exists($configPath)) {
            self::$config = require $configPath;
        } else {
            self::$config = self::getDefaultConfig();
        }
    }

    protected static function getDefaultConfig()
    {
        return [
            'app_key' => null,
            'container_id' => 'antonella-react-root',
            'app_env' => 'production',
            'vite_server' => 'http://localhost:3000',
            'build_path' => 'assets/dist',
            'entry_point' => 'resources/js/app.jsx',
            'load_in_admin' => true,
            'load_in_frontend' => true,
            'version' => null,
        ];
    }

    protected static function setComponent(string $component)
    {
        self::$component = $component;
    }

    protected static function setProps(array $props)
    {
        $props = array_merge($props, self::$sharedProps);
        
        array_walk_recursive($props, function (&$prop) {
            if ($prop instanceof LazyProp) {
                $prop = $prop();
            }
            
            if ($prop instanceof Closure) {
                $prop = $prop();
            }
        });
        
        self::$props = $props;
    }

    protected static function getCurrentUrl()
    {
        return isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
    }

    protected static function enqueueDevScripts()
    {
        $appKey = self::getAppKey();
        $viteClientHandle = 'antonella-react-vite-client-' . $appKey;
        $appHandle = 'antonella-react-app-' . $appKey;
        $viteServer = self::getConfig('vite_server', 'http://localhost:3000');
        $entryPoint = self::getConfig('entry_point', 'resources/js/app.jsx');
        
        wp_enqueue_script(
            $viteClientHandle,
            $viteServer . '/@vite/client',
            [],
            null,
            false
        );
        
        $refreshScript = "
            import { injectIntoGlobalHook } from '{$viteServer}/@react-refresh';
            injectIntoGlobalHook(window);
            window.\$RefreshReg$ = () => {};
            window.\$RefreshSig$ = () => (type) => type;
        ";

        add_filter('wp_inline_script_attributes', function ($attributes, $handle) use ($viteClientHandle) {
            if ($handle === $viteClientHandle) {
                $attributes['type'] = 'module';
            }

            return $attributes;
        }, 10, 2);
        
        wp_add_inline_script(
            $viteClientHandle,
            $refreshScript,
            'before'
        );
        
        wp_enqueue_script(
            $appHandle,
            $viteServer . '/' . $entryPoint,
            ['wp-i18n'],
            null,
            true
        );

        wp_set_script_translations($appHandle, 'jeelshha', dirname(dirname(__DIR__)) . '/languages');

        if (function_exists('wp_script_add_data')) {
            wp_script_add_data($appHandle, 'type', 'module');
        }
        
        self::localizeScriptData($appHandle);
    }

    protected static function enqueueProductionScripts()
    {
        $appKey = self::getAppKey();
        $manifest = self::getManifest();
        
        if (!$manifest) {
            return;
        }

        $buildPath = self::getConfig('build_path', 'assets/dist');
        $pluginUrl = plugin_dir_url(dirname(__DIR__));
        $baseUrl = $pluginUrl . $buildPath . '/';
        $entryPoint = self::getConfig('entry_point', 'resources/js/app.jsx');
        $version = self::$version ?? self::getConfig('version', null);
        
        if (!isset($manifest[$entryPoint])) {
            return;
        }

        if (isset($manifest[$entryPoint]['imports'])) {
            foreach ($manifest[$entryPoint]['imports'] as $index => $import) {
                if (isset($manifest[$import]['file'])) {
                    wp_enqueue_script(
                        'antonella-react-vendor-' . $appKey . '-' . $index,
                        $baseUrl . $manifest[$import]['file'],
                        [],
                        $version,
                        true
                    );
                }
            }
        }

        if (isset($manifest[$entryPoint]['css'])) {
            foreach ($manifest[$entryPoint]['css'] as $index => $cssFile) {
                wp_enqueue_style(
                    'antonella-react-style-' . $appKey . '-' . $index,
                    $baseUrl . $cssFile,
                    [],
                    $version
                );
            }
        }

        if (isset($manifest[$entryPoint]['file'])) {
            wp_enqueue_script(
                'antonella-react-app-' . $appKey,
                $baseUrl . $manifest[$entryPoint]['file'],
                ['wp-i18n'],
                $version,
                true
            );
            
            wp_set_script_translations('antonella-react-app-' . $appKey, 'jeelshha', dirname(dirname(__DIR__)) . '/languages');

            self::localizeScriptData('antonella-react-app-' . $appKey);
        }
    }

    protected static function renderDefaultTemplate()
    {
        $containerId = self::$currentContainerId ?? self::getConfig('container_id', 'antonella-react-root');
        $isDev = self::getConfig('app_env', 'production') === 'develop';
        $viteServer = self::getConfig('vite_server', 'http://localhost:3000');
        
        ?>
        <script>
            if (!document.querySelector('meta[name="antonella-react-container"]')) {
                const meta = document.createElement('meta');
                meta.name = 'antonella-react-container';
                meta.content = '<?php echo esc_js($containerId); ?>';
                document.head.appendChild(meta);
            }

            <?php if ($isDev): ?>
            (function() {
                const containerId = '<?php echo esc_js($containerId); ?>';
                const viteServer = '<?php echo esc_js($viteServer); ?>';
                const timeout = setTimeout(function() {
                    const container = document.getElementById(containerId);
                    if (container && container.innerHTML.trim() === '') {
                        container.innerHTML = `
                            <div style="
                                max-width: 600px;
                                margin: 40px auto;
                                padding: 30px;
                                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                                border-radius: 12px;
                                border-left: 4px solid #e74c3c;
                                color: #ecf0f1;
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                            ">
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                                    <span style="font-size: 28px;">⚡</span>
                                    <h2 style="margin: 0; font-size: 20px; color: #e74c3c;">Vite Dev Server Not Running</h2>
                                </div>
                                <p style="margin: 0 0 16px; color: #bdc3c7; line-height: 1.6;">
                                    The React development server is not available at <code style="background: #2c3e50; padding: 2px 8px; border-radius: 4px; color: #3498db;"><?php echo esc_js($viteServer); ?></code>
                                </p>
                                <div style="background: #2c3e50; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                                    <p style="margin: 0 0 8px; color: #95a5a6; font-size: 13px;">Run this command in your terminal:</p>
                                    <code style="display: block; color: #2ecc71; font-size: 15px; font-family: 'Fira Code', 'Consolas', monospace;">$ npm run dev</code>
                                </div>
                                <p style="margin: 0; color: #7f8c8d; font-size: 12px;">
                                    This message only appears in develop mode. Set <code style="background: #2c3e50; padding: 1px 6px; border-radius: 3px;">app_env => 'production'</code> in <code style="background: #2c3e50; padding: 1px 6px; border-radius: 3px;">Config/React.php</code> to use built assets.
                                </p>
                            </div>
                        `;
                    }
                }, 3000);

                window.addEventListener('vite:ws-connect', function() {
                    clearTimeout(timeout);
                });
            })();
            <?php endif; ?>
        </script>
        <?php self::injectIsolationStyles($containerId); ?>
        <?php self::inject(); ?>
        <?php
    }

    protected static function injectIsolationStyles(string $containerId): void
    {
        $enabled = self::getConfig('style_isolation', true);
        if (!$enabled) {
            return;
        }

        $mode = self::getConfig('style_isolation_mode', 'reset');
        $id = esc_attr($containerId);
        $sel = '[id="' . $id . '"]';

        if ($mode === 'reset') {
            $css = "
{$sel},
{$sel} *,
{$sel} *::before,
{$sel} *::after {
    all: revert;
    box-sizing: border-box;
}
{$sel} {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: #111827;
}
{$sel} p,
{$sel} h1, {$sel} h2, {$sel} h3, {$sel} h4, {$sel} h5, {$sel} h6 {
    margin: 0;
    padding: 0;
    font-size: revert;
    font-weight: revert;
    line-height: revert;
}
{$sel} a { color: revert; text-decoration: revert; }
{$sel} button { cursor: pointer; }
{$sel} ul, {$sel} ol { margin: 0; padding: 0; list-style: none; }
{$sel} li { margin: 0; padding: 0; }
{$sel} img { max-width: 100%; height: auto; display: block; border: none; }
{$sel} input, {$sel} select, {$sel} textarea {
    margin: 0;
    padding: 0;
    border: revert;
    font-family: inherit;
    font-size: inherit;
}
{$sel} table { border-collapse: collapse; border-spacing: 0; }
{$sel} th, {$sel} td { padding: 0; text-align: left; vertical-align: top; }";
        } else {
            $css = "
{$sel},
{$sel} * {
    box-sizing: border-box;
}
{$sel} p,
{$sel} h1, {$sel} h2, {$sel} h3, {$sel} h4, {$sel} h5, {$sel} h6,
{$sel} ul, {$sel} ol, {$sel} li,
{$sel} blockquote, {$sel} figure {
    margin: 0;
    padding: 0;
}
{$sel} ul, {$sel} ol { list-style: none; }
{$sel} img { max-width: 100%; height: auto; display: block; }
{$sel} button { cursor: pointer; }
{$sel} a { text-decoration: none; }
{$sel} table { border-collapse: collapse; }";
        }

        echo '<style id="antonella-isolation-' . esc_attr($containerId) . '">' . $css . "\n</style>\n";
    }

    public static function init()
    {
        self::loadConfig();
        
        $loadInAdmin = self::getConfig('load_in_admin', true);
        $loadInFrontend = self::getConfig('load_in_frontend', true);

        if (is_admin() && $loadInAdmin) {
            add_action('admin_enqueue_scripts', [__CLASS__, 'enqueueScripts']);
            add_action('admin_head', [__CLASS__, 'injectContainerMeta']);
        }

        if (!is_admin() && $loadInFrontend) {
            add_action('wp_enqueue_scripts', [__CLASS__, 'enqueueScripts']);
            add_action('wp_head', [__CLASS__, 'injectContainerMeta']);
        }
    }

    public static function injectContainerMeta()
    {
        $containerId = self::getConfig('container_id', 'antonella-react-root');
        echo sprintf(
            '<meta name="antonella-react-container" content="%s">' . "\n",
            esc_attr($containerId)
        );
    }

    protected static function validateProductionAssets()
    {
        $buildPath = self::getConfig('build_path', 'assets/dist');
        $manifestPath = dirname(dirname(__DIR__)) . DIRECTORY_SEPARATOR . $buildPath . DIRECTORY_SEPARATOR . '.vite' . DIRECTORY_SEPARATOR . 'manifest.json';
        
        return file_exists($manifestPath);
    }

    protected static function showAssetsError()
    {
        add_action('admin_notices', function() {
            $buildPath = self::getConfig('build_path', 'assets/dist');
            $manifestPath = dirname(dirname(__DIR__)) . DIRECTORY_SEPARATOR . $buildPath . DIRECTORY_SEPARATOR . '.vite' . DIRECTORY_SEPARATOR . 'manifest.json';
            
            echo '<div class="notice notice-error"><p>';
            echo '<strong>Antonella React:</strong> ';
            echo sprintf(
                'Build manifest not found. Expected file: <code>%s</code>. Please run <code>npm run build</code>.',
                esc_html($manifestPath)
            );
            echo '</p></div>';
        });
    }

    protected static function getManifest()
    {
        if (self::$manifest !== null) {
            return self::$manifest;
        }

        $buildPath = self::getConfig('build_path', 'assets/dist');
        $manifestPath = dirname(dirname(__DIR__)) . DIRECTORY_SEPARATOR . $buildPath . DIRECTORY_SEPARATOR . '.vite' . DIRECTORY_SEPARATOR . 'manifest.json';
        
        if (!file_exists($manifestPath)) {
            return null;
        }

        $manifestContent = file_get_contents($manifestPath);
        self::$manifest = json_decode($manifestContent, true);

        return self::$manifest;
    }

    public static function addModuleType($tag, $handle)
    {
        // Debug: Ensure we are targeting the right scripts
        if (strpos($handle, 'antonella-react') === false) {
            return $tag;
        }

        // If it already has it, don't add it again
        if (strpos($tag, 'type="module"') !== false || strpos($tag, "type='module'") !== false) {
            return $tag;
        }

        // More aggressive replacement to bypass any WP filtering issues
        $tag = str_replace('<script ', '<script type="module" ', $tag);
        
        // Ensure even if there are weird spaces it gets caught
        if (strpos($tag, 'type="module"') === false) {
             $tag = preg_replace('/<script/i', '<script type="module"', $tag, 1);
        }

        return $tag;
    }

    protected static function localizeScriptData($handle)
    {
        $currentUser = wp_get_current_user();
        $appKey = self::getAppKey();
        $objectName = 'antonella_react_' . $appKey;
        
        wp_localize_script(
            $handle,
            $objectName,
            [
                'appKey' => $appKey,
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('antonella_react_nonce'),
                'siteUrl' => get_site_url(),
                'siteName' => get_bloginfo('name'),
                'currentUser' => [
                    'id' => $currentUser->ID,
                    'name' => $currentUser->display_name,
                    'email' => $currentUser->user_email,
                ],
                'pageData' => self::$pageData,
            ]
        );

        // Encolar scripts globales personalizados desde la configuración
        $globalScripts = self::getConfig('global_localize_script', []);
        if (!empty($globalScripts) && is_array($globalScripts)) {
            foreach ($globalScripts as $objectName => $data) {
                wp_localize_script($handle, $objectName, $data);
            }
        }
    }

    protected static function getAppKey(): string
    {
        $appKey = self::getConfig('app_key', null);
        if (!$appKey) {
            $appKey = basename(dirname(dirname(__DIR__)));
        }

        return self::sanitizeKey($appKey);
    }

    protected static function sanitizeKey(string $value): string
    {
        $value = strtolower($value);
        $value = preg_replace('/[^a-z0-9_-]/', '-', $value);
        return trim($value, '-');
    }

    protected static function nextContainerId(): string
    {
        $baseId = self::getConfig('container_id', 'antonella-react-root');
        if ($baseId === 'antonella-react-root') {
            $baseId .= '-' . self::getAppKey();
        }
        self::$renderIndex++;
        return $baseId . '-' . self::$renderIndex;
    }
}

class LazyProp
{
    protected $callback;

    public function __construct(callable $callback)
    {
        $this->callback = $callback;
    }

    public function __invoke()
    {
        return call_user_func($this->callback);
    }
}