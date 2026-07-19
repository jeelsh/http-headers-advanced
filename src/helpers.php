<?php


defined('ABSPATH') or die();

/**
 * Antonella Helpers
 * Dont Touch this file
 * for more info
 * https://antonellaframework.com/documentacion
 */

(function () {
    foreach (glob(__DIR__ . '/Helpers/*.php') as $filename) {
        require   $filename;
    }
})();
