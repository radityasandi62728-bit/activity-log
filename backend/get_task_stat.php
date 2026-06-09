<?php

include 'auth.php';
include 'db.php';

header('Content-Type: application/json');

$stmtTotal = mysqli_prepare($conn,
    "SELECT COUNT(*) AS total FROM tasks WHERE user_id = ?"
);
mysqli_stmt_bind_param($stmtTotal, "i", $current_user_id);
mysqli_stmt_execute($stmtTotal);
$rowTotal = mysqli_fetch_assoc(mysqli_stmt_get_result($stmtTotal));

$stmtHours = mysqli_prepare($conn,
    "SELECT SUM(TIMESTAMPDIFF(MINUTE, created_at, completed_at)) AS total_minutes
     FROM tasks
     WHERE user_id = ?
     AND done = 1
     AND completed_at IS NOT NULL"
);
mysqli_stmt_bind_param($stmtHours, "i", $current_user_id);
mysqli_stmt_execute($stmtHours);
$rowHours = mysqli_fetch_assoc(mysqli_stmt_get_result($stmtHours));

$totalMinutes = (int)($rowHours['total_minutes'] ?? 0);
$hours        = floor($totalMinutes / 60);
$minutes      = $totalMinutes % 60;

echo json_encode([
    "success"      => true,
    "total_tasks"  => (int)$rowTotal['total'],
    "total_minutes"=> $totalMinutes,
    "hours"        => $hours,
    "minutes"      => $minutes,
    "display"      => $hours . "j " . $minutes . "m"
]);
?>