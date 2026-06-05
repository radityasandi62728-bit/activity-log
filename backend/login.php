<?php

header('Content-Type: application/json');

include 'db.php';

$data =
    json_decode(file_get_contents("php://input"), true);

$email =
    $data['email'];

$password =
    $data['password'];

$sql =
    "SELECT * FROM users
     WHERE email='$email'
     LIMIT 1";

$result =
    mysqli_query($conn, $sql);

if (!$result || mysqli_num_rows($result) === 0) {

    echo json_encode([
        "success" => false,
        "message" => "EMAIL TIDAK DITEMUKAN"
    ]);

    exit;
}

$user = mysqli_fetch_assoc($result);

if ($password !== $user['password']) {

    echo json_encode([
        "success" => false,
        "message" => "PASSWORD SALAH"
    ]);

    exit;
}

echo json_encode([
    "success" => true
]);