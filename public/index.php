<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Sanitize $_SERVER variables that may contain CR/LF characters
// (injected by some hosting environments like Render.com)
foreach ($_SERVER as $key => $value) {
    if (is_string($value)) {
        $_SERVER[$key] = str_replace(["\r", "\n", "\t"], '', $value);
    }
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
