<?php

include 'db.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $activity = isset($_POST['activity']) ? mysqli_real_escape_string($conn, $_POST['activity']) : '';

    $sql = "INSERT INTO activity_logs (user_id, activity_text)
            VALUES (1, '$activity')";

    $result = mysqli_query($conn, $sql);

    if ($result) {
        echo "success";
    } else {
        echo mysqli_error($conn);
    }
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    header('Content-Type: application/json; charset=utf-8');

    $sql = "SELECT id, user_id, activity_text, created_at
            FROM activity_logs
            ORDER BY created_at DESC";
    $result = mysqli_query($conn, $sql);

    $rows = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
    }

    echo json_encode($rows);
    exit;
}

http_response_code(405);
echo 'Method not allowed';

?>