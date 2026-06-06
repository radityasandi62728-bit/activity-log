<?php
header('Content-Type: application/json');
include 'db.php';

$id   = (int) $_POST['id'];
$done = (int) $_POST['done'];

if ($done === 1) {
    $sql = "UPDATE tasks SET done=1, completed_at=NOW() WHERE id=$id";
} else {
    // Jika di-uncheck, hapus completed_at
    $sql = "UPDATE tasks SET done=0, completed_at=NULL WHERE id=$id";
}

if (mysqli_query($conn, $sql)) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => mysqli_error($conn)]);
}
?>