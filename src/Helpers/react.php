<?php

use JEELSHHA\Core\React;

/**
 * React Helper Functions
 * 
 * Global helper functions for React integration
 */

if (!function_exists('react')) {
    function react(string $component, array $props = [])
    {
        return React::render($component, $props);
    }
}

if (!function_exists('react_share')) {
    function react_share($key, $value = null)
    {
        React::share($key, $value);
    }
}

if (!function_exists('react_lazy')) {
    function react_lazy(callable $callback)
    {
        return React::lazy($callback);
    }
}