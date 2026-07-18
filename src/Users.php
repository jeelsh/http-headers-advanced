<?php

namespace JEELSHHA;

defined('ABSPATH') or die();


class Users
{
    public $user;
    public function __construct()
    {
         $this->user = wp_get_current_user();
    }
}
