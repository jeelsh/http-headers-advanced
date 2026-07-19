<?php

namespace JEELSHHA;

use JEELSHHA\Services\HtaccessWriter;

defined('ABSPATH') or die();


class Desactivate
{
    /*
    *
    */
    public static function index()
    {
        // Remove .htaccess HTTP headers block if exists
        HtaccessWriter::remove();
    }
}
