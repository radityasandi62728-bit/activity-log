<?php
 
include 'auth.php';
include 'db.php';
 
header('Content-Type: application/json');
 
$stmt = mysqli_prepare($conn,
    "SELECT id, name, username, email, avatar, created_at, last_login
     FROM users
     WHERE id = ?
     LIMIT 1"
);
mysqli_stmt_bind_param($stmt, "i", $current_user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
 
if ($result && mysqli_num_rows($result) > 0) {
    echo json_encode(["success" => true, "data" => mysqli_fetch_assoc($result)]);
} else {
    echo json_encode(["success" => false, "message" => "User tidak ditemukan"]);
}