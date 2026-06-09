<?php
 
include 'auth.php';
include 'db.php';
 
header('Content-Type: application/json');
 
$stmt = mysqli_prepare($conn,
    "SELECT * FROM tasks
     WHERE user_id = ?
     AND deleted_at IS NULL
     ORDER BY created_at DESC"
);
mysqli_stmt_bind_param($stmt, "i", $current_user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
 
$tasks = [];
while ($row = mysqli_fetch_assoc($result)) {
    $tasks[] = $row;
}
 
echo json_encode(["success" => true, "data" => $tasks]);
 