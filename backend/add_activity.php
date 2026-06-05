<?php

include 'db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $activity = isset($_POST['activity']) 
        ? mysqli_real_escape_string($conn, $_POST['activity']) 
        : '';

    if ($activity === '') {
        echo json_encode(["status" => "error", "message" => "activity kosong"]);
        exit;
    }

    $sql = "INSERT INTO activity_logs (user_id, activity_text) VALUES (1, '$activity')";
    $result = mysqli_query($conn, $sql);

    echo $result 
        ? json_encode(["status" => "success"]) 
        : json_encode(["status" => "error", "message" => mysqli_error($conn)]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $sql = "SELECT id, activity_text, created_at 
            FROM activity_logs 
            ORDER BY created_at DESC 
            LIMIT 50";
    $result = mysqli_query($conn, $sql);

    $rows = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $rows[] = $row;
    }

    echo json_encode($rows);
    exit;
}
?>