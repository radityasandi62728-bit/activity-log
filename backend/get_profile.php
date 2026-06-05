<?php

header('Content-Type: application/json');

include 'db.php';

$id = 1;

$sql = "SELECT * FROM users WHERE id=$id";

$result = mysqli_query($conn, $sql);

if ($result && mysqli_num_rows($result) > 0) {

    $user = mysqli_fetch_assoc($result);

    echo json_encode([
        "success" => true,
        "data" => $user
    ]);

} else {

    echo json_encode([
        "success" => false
    ]);
}
?>