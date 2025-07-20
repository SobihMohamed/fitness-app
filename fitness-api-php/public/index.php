<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin === 'http://localhost:3000') {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

require_once '../vendor/autoload.php';
require_once '../app/core/App.php';
require_once '../app/core/AbstractController.php';

use App\Core\App;
$app = new App();

?>