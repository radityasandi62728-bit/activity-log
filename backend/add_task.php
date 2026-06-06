<?php
header('Content-Type: application/json');
include 'db.php';

$user_id = 1;
$text = mysqli_real_escape_string($conn, $_POST['text']);

$sql = "INSERT INTO tasks (user_id, text) VALUES ($user_id, '$text')";

if (mysqli_query($conn, $sql)) {
    echo json_encode([
        "success" => true,
        "id" => mysqli_insert_id($conn)
    ]);
} else {
    echo json_encode(["success" => false, "message" => mysqli_error($conn)]);
}
?>