<?php
header('Content-Type: application/json');
include 'db.php';

$user_id = 1;

$sql = "SELECT SUM(TIMESTAMPDIFF(MINUTE, created_at, completed_at)) AS total_minutes 
        FROM tasks 
        WHERE user_id=$user_id 
        AND done=1 
        AND completed_at IS NOT NULL
        AND deleted_at IS NULL";

$result = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($result);

// Debug — lihat raw value dari DB
error_log("total_minutes raw: " . print_r($row, true));

$totalMinutes = (int)($row['total_minutes'] ?? 0);
$hours        = floor($totalMinutes / 60);
$minutes      = $totalMinutes % 60;

echo json_encode([
    "success"       => true,
    "total_minutes" => $totalMinutes,
    "hours"         => $hours,
    "minutes"       => $minutes,
    "display"       => $hours . "j " . $minutes . "m",
    "debug_raw"     => $row  // ← tambah ini sementara
]);
?>