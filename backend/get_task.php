<?php
header('Content-Type: application/json');
include 'db.php';

$id = 1;
$sql = "SELECT * FROM tasks WHERE user_id=$id AND deleted_at IS NULL ORDER BY created_at DESC";
$result = mysqli_query($conn, $sql);

$tasks = [];
while ($row = mysqli_fetch_assoc($result)) {
    $tasks[] = $row;
}

echo json_encode(["success" => true, "data" => $tasks]);
?>