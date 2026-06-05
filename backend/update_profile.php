<?php

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');

include 'db.php';

/* USER FIX */
$id = 1;

/* DATA */
$name     = $_POST['name'];
$username = $_POST['username'];
$email    = $_POST['email'];

/* =========================
   UPLOAD AVATAR
========================= */

if (isset($_FILES['avatar'])) {

    if ($_FILES['avatar']['error'] === 0) {

        $fileName =
            time() . '_' . basename($_FILES['avatar']['name']);

        $targetPath =
            "../uploads/" . $fileName;

        $dbPath =
            "/nexus/uploads/" . $fileName;

        $move =
            move_uploaded_file(
                $_FILES['avatar']['tmp_name'],
                $targetPath
            );

        if ($move) {

            $avatarPath = $dbPath;

        } else {

            echo json_encode([
                "success" => false,
                "message" => "GAGAL MOVE FILE"
            ]);

            exit;
        }

    } else {

        echo json_encode([
            "success" => false,
            "message" => "UPLOAD ERROR CODE: " .
                         $_FILES['avatar']['error']
        ]);

        exit;
    }

} else {

    $avatarPath = null;
}

/* =========================
   UPDATE DATABASE
========================= */

$sql = "UPDATE users SET
    name='$name',
    username='$username',
    email='$email'";

/* kalau avatar baru ada */
if ($avatarPath) {

    $sql .= ", avatar='$avatarPath'";
}

$sql .= " WHERE id=$id";

/* =========================
   EXECUTE
========================= */

if (mysqli_query($conn, $sql)) {

    echo json_encode([
        "success" => true
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => mysqli_error($conn)
    ]);
}
?>