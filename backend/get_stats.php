<?php
 
include 'auth.php';
include 'db.php';
 
header('Content-Type: application/json');
 
$stmt = mysqli_prepare($conn,
    "SELECT COUNT(*) AS total
     FROM activity_logs
     WHERE user_id = ?"
);
mysqli_stmt_bind_param($stmt, "i", $current_user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$row = mysqli_fetch_assoc($result);
 
echo json_encode([
    "success"   => true,
    "totalLogs" => (int) ($row['total'] ?? 0)
]);