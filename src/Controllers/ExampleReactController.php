<?php

namespace JEELSHHA\Controllers;

use JEELSHHA\Core\React;

class ExampleReactController
{
    public static function boot()
    {
        React::share([
            'user' => [
                'name' => wp_get_current_user()->display_name,
                'email' => wp_get_current_user()->user_email,
            ],
            'site' => [
                'name' => get_bloginfo('name'),
                'url' => get_site_url(),
            ],
        ]);
    }

    public static function card()
    {
        return React::render('Card', ['title' => 'Card Title', 'content' => 'Card Content']);
    }

    public static function helloWorldPage()
    {
        $pageData = [
            'title' => 'Hello World with React',
            'message' => 'Welcome to Antonella Framework React Integration!',
            'timestamp' => current_time('mysql'),
            'posts_count' => wp_count_posts()->publish,
        ];
        
        echo React::render('HelloWorld', $pageData);
    }

    public static function helloWorld()
    {
        return React::render('ExampleComponent', ['name' => 'Antonella']);
    }
}