<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include 'db.php';
header('Content-Type: application/json; charset=utf-8');

$user_id = (int) ($_SESSION['user_id'] ?? 0);
if ($user_id <= 0) {
    echo json_encode([]);
    exit;
}
 
if ($_SERVER["REQUEST_METHOD"] === "POST") {
 
    $activity = trim($_POST['activity'] ?? '');
 
    if ($activity === '') {
        echo json_encode(["status" => "error", "message" => "activity kosong"]);
        exit;
    }
 
    $stmt = mysqli_prepare($conn, "INSERT INTO activity_logs (user_id, activity_text) VALUES (?, ?)");
    mysqli_stmt_bind_param($stmt, "is", $user_id, $activity);
    $result = mysqli_stmt_execute($stmt);
 
    echo $result
        ? json_encode(["status" => "success"])
        : json_encode(["status" => "error", "message" => mysqli_error($conn)]);
    exit;
}
 
if ($_SERVER["REQUEST_METHOD"] === "GET") {
 
    $stmt = mysqli_prepare($conn,
        "SELECT id, activity_text, created_at
         FROM activity_logs
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 50"
    );
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
 
    $rows = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $rows[] = $row;
    }
 
    echo json_encode($rows);
    exit;
}