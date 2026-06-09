<?php
 
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
 
if (empty($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
 
    header('Content-Type: application/json');
 
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);
 
    exit;
}
 
$current_user_id = (int) $_SESSION['user_id'];
 