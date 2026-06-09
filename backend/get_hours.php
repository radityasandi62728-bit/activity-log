<?php
 
include 'auth.php';
include 'db.php';
 
header('Content-Type: application/json');
 
$stmt = mysqli_prepare($conn,
    "SELECT SUM(TIMESTAMPDIFF(MINUTE, created_at, completed_at)) AS total_minutes
     FROM tasks
     WHERE user_id = ?
     AND done = 1
     AND completed_at IS NOT NULL
     AND deleted_at IS NULL"
);
mysqli_stmt_bind_param($stmt, "i", $current_user_id);
mysqli_stmt_execute($stmt);
$row = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
 
$totalMinutes = (int) ($row['total_minutes'] ?? 0);
$hours        = floor($totalMinutes / 60);
$minutes      = $totalMinutes % 60;
 
echo json_encode([
    "success"       => true,
    "total_minutes" => $totalMinutes,
    "hours"         => $hours,
    "minutes"       => $minutes,
    "display"       => $hours . "j " . $minutes . "m"
]);