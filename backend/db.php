<?php
$conn = mysqli_connect(
    "localhost",
    "root",
    "",
    "activity_tracker"
);

if (!$conn) {
    die("Koneksi gagal");
}
?>