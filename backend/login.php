<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');

include 'db.php';

$data     = json_decode(file_get_contents("php://input"), true);
$email    = $data['email']    ?? '';
$password = $data['password'] ?? '';
 
if (empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Email dan password wajib diisi"]);
    exit;
}
 
$stmt = mysqli_prepare($conn, "SELECT * FROM users WHERE email = ? LIMIT 1");
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
 
if (!$result || mysqli_num_rows($result) === 0) {
    echo json_encode(["success" => false, "message" => "EMAIL TIDAK DITEMUKAN"]);
    exit;
}
 
$user = mysqli_fetch_assoc($result);
 
$passwordOk = password_verify($password, $user['password'])
    || ($password === $user['password']);

if (!$passwordOk) {
    echo json_encode(["success" => false, "message" => "PASSWORD SALAH"]);
    exit;
}
 
$_SESSION['logged_in']  = true;
$_SESSION['user_id']    = $user['id'];
$_SESSION['email']      = $user['email'];
$_SESSION['username']   = $user['username'] ?? '';
$_SESSION['rank_name']  = $user['rank_name'] ?? 'ALPHA';
 
// Update last_login
$stmtUpdate = mysqli_prepare($conn, "UPDATE users SET last_login = NOW() WHERE id = ?");
mysqli_stmt_bind_param($stmtUpdate, "i", $user['id']);
mysqli_stmt_execute($stmtUpdate);
 
echo json_encode(["success" => true]);