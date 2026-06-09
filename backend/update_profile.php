<?php
 
error_reporting(0);
ini_set('display_errors', 0);
 
include 'auth.php';
include 'db.php';
 
header('Content-Type: application/json');
 
$name     = trim($_POST['name']     ?? '');
$username = trim($_POST['username'] ?? '');
$email    = trim($_POST['email']    ?? '');
 
if (!$name || !$email) {
    echo json_encode(["success" => false, "message" => "Nama dan email wajib diisi"]);
    exit;
}
 
/* =========================
   UPLOAD AVATAR
========================= */
 
$avatarPath = null;
 
if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === 0) {
 
    $fileName   = time() . '_' . basename($_FILES['avatar']['name']);
    $targetPath = "../uploads/" . $fileName;
    $dbPath     = "/nexus/uploads/" . $fileName;
 
    if (move_uploaded_file($_FILES['avatar']['tmp_name'], $targetPath)) {
        $avatarPath = $dbPath;
    } else {
        echo json_encode(["success" => false, "message" => "GAGAL MOVE FILE"]);
        exit;
    }
}
 
/* =========================
   UPDATE DATABASE
========================= */
 
if ($avatarPath) {
    $stmt = mysqli_prepare($conn,
        "UPDATE users SET name=?, username=?, email=?, avatar=? WHERE id=?"
    );
    mysqli_stmt_bind_param($stmt, "ssssi", $name, $username, $email, $avatarPath, $current_user_id);
} else {
    $stmt = mysqli_prepare($conn,
        "UPDATE users SET name=?, username=?, email=? WHERE id=?"
    );
    mysqli_stmt_bind_param($stmt, "sssi", $name, $username, $email, $current_user_id);
}
 
if (mysqli_stmt_execute($stmt)) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => mysqli_error($conn)]);
}