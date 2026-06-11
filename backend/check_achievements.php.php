<?php

include 'auth.php';
include 'db.php';

header('Content-Type: application/json');

$uid = (int) $current_user_id;

$stmt = $conn->prepare("SELECT a.id, a.code, a.name, a.description, a.image, ua.unlocked_at
    FROM achievements a
    LEFT JOIN user_achievements ua
      ON ua.achievement_id = a.id AND ua.user_id = ?
    ORDER BY a.id ASC");
$stmt->bind_param('i', $uid);
$stmt->execute();
$allAch = $stmt->get_result();

$achievements = [];
while ($row = $allAch->fetch_assoc()) {
    $achievements[$row['code']] = $row;
}

$conditions = [];

$stmt = $conn->prepare("SELECT COUNT(*) AS c FROM activity_logs WHERE user_id=?");
$stmt->bind_param('i', $uid);
$stmt->execute();
$first = $stmt->get_result()->fetch_assoc();
$conditions['first_log'] = (int) $first['c'] >= 1;

$stmt = $conn->prepare("SELECT COUNT(*) AS c FROM activity_logs WHERE user_id=? AND (HOUR(created_at) >= 21 OR HOUR(created_at) < 4)");
$stmt->bind_param('i', $uid);
$stmt->execute();
$night = $stmt->get_result()->fetch_assoc();
$conditions['night_hunter'] = (int) $night['c'] >= 1;

$stmt = $conn->prepare("SELECT COUNT(*) AS c FROM activity_logs WHERE user_id=? AND HOUR(created_at) BETWEEN 5 AND 6");
$stmt->bind_param('i', $uid);
$stmt->execute();
$early = $stmt->get_result()->fetch_assoc();
$conditions['early_bird'] = (int) $early['c'] >= 1;

$stmt = $conn->prepare("SELECT COUNT(*) AS c FROM tasks WHERE user_id=? AND done=1");
$stmt->bind_param('i', $uid);
$stmt->execute();
$task = $stmt->get_result()->fetch_assoc();
$conditions['task_master'] = (int) $task['c'] >= 5;

$stmt = $conn->prepare("SELECT DISTINCT DATE(created_at) AS d
    FROM activity_logs
    WHERE user_id=?
    ORDER BY d DESC
    LIMIT 7");
$stmt->bind_param('i', $uid);
$stmt->execute();
$dates = [];
$res = $stmt->get_result();
while ($row = $res->fetch_assoc()) {
    $dates[] = $row['d'];
}

$streak7 = false;
if (count($dates) === 7) {
    $streak7 = true;
    for ($i = 0; $i < 6; $i++) {
        $diff = (strtotime($dates[$i]) - strtotime($dates[$i + 1])) / 86400;
        if ($diff !== 1.0) {
            $streak7 = false;
            break;
        }
    }
}
$conditions['seven_streak'] = $streak7;

foreach ($conditions as $code => $met) {
    if (!$met) continue;
    if (!isset($achievements[$code]) || !empty($achievements[$code]['unlocked_at'])) continue;

    $achId = (int) $achievements[$code]['id'];
    $ins = $conn->prepare("INSERT IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)");
    $ins->bind_param('ii', $uid, $achId);
    $ins->execute();

    $achievements[$code]['unlocked_at'] = date('Y-m-d H:i:s');
}

$result = [];
foreach ($achievements as $code => $ach) {
    $image = trim((string)($ach['image'] ?? ''));

    if ($image === '') {
        $candidate = __DIR__ . '/asset/achievements/' . $code . '.png';
        if (file_exists($candidate)) {
            $image = '/nexus/asset/achievements/' . $code . '.png';
        }
    } else if (!preg_match('#^https?://#i', $image) && !str_starts_with($image, '/')) {
        if (str_starts_with($image, 'asset/')) {
            $image = '/nexus/' . $image;
        } else if (str_starts_with($image, 'achievements/')) {
            $image = '/nexus/asset/' . $image;
        } else if (preg_match('/\.(png|jpg|jpeg|gif|webp)$/i', $image)) {
            $image = '/nexus/asset/achievements/' . ltrim($image, '/');
        }
    }

    $result[] = [
        'code' => $code,
        'name' => $ach['name'],
        'description' => $ach['description'],
        'image' => $image !== '' ? $image : null,
        'unlocked' => !empty($ach['unlocked_at']),
        'unlocked_at' => $ach['unlocked_at'] ?? null,
    ];
}

echo json_encode(['success' => true, 'data' => $result]);