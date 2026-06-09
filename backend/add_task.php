<?php
 
include 'auth.php';
include 'db.php';
 
header('Content-Type: application/json');
 
$text = trim($_POST['text'] ?? '');
 
if ($text === '') {
    echo json_encode(["success" => false, "message" => "Teks tugas kosong"]);
    exit;
}
 
$stmt = mysqli_prepare($conn, "INSERT INTO tasks (user_id, text) VALUES (?, ?)");
mysqli_stmt_bind_param($stmt, "is", $current_user_id, $text);
 
if (mysqli_stmt_execute($stmt)) {
    echo json_encode(["success" => true, "id" => mysqli_insert_id($conn)]);
} else {
    echo json_encode(["success" => false, "message" => mysqli_error($conn)]);
}