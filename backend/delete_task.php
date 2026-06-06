<?php
header('Content-Type: application/json');
include 'db.php';

$id = (int) $_POST['id'];
$sql = "UPDATE tasks SET deleted_at=NOW() WHERE id=$id";

if (mysqli_query($conn, $sql)) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => mysqli_error($conn)]);
}
?>