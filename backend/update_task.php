<?php
 
include 'auth.php';
include 'db.php';
 
header('Content-Type: application/json');
 
$id   = (int) ($_POST['id']   ?? 0);
$done = (int) ($_POST['done'] ?? 0);
 
if (!$id) {
    echo json_encode(["success" => false, "message" => "ID tidak valid"]);
    exit;
}
 
if ($done === 1) {
    $stmt = mysqli_prepare($conn,
        "UPDATE tasks SET done=1, completed_at=NOW()
         WHERE id=? AND user_id=?"
    );
} else {
    $stmt = mysqli_prepare($conn,
        "UPDATE tasks SET done=0, completed_at=NULL
         WHERE id=? AND user_id=?"
    );
}
 
mysqli_stmt_bind_param($stmt, "ii", $id, $current_user_id);
 
if (mysqli_stmt_execute($stmt)) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => mysqli_error($conn)]);
}