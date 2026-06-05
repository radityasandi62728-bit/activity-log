<?php

header('Content-Type: application/json');

include 'db.php';

$userId = 1;

/* =========================
   TOTAL LOG
========================= */

$sql =
    "SELECT COUNT(*) as total
     FROM activity_logs
     WHERE user_id = $userId";

$result = mysqli_query($conn, $sql);

$row = mysqli_fetch_assoc($result);

$totalLogs = $row['total'] ?? 0;

echo json_encode([
    "success" => true,
    "totalLogs" => $totalLogs
]);