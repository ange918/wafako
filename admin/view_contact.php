<?php
session_start();
require_once '../includes/config.php';

// Sécurité admin
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: login.php");
    exit;
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0 || !$pdo) {
    header("Location: dashboard.php");
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM contacts WHERE id = ?");
$stmt->execute([$id]);
$contact = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$contact) {
    header("Location: dashboard.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Voir message</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .box {
            max-width: 700px;
            margin: 50px auto;
            background: #fff;
            padding: 30px;
            border-radius: 6px;
        }
        .box h2 {
            margin-bottom: 20px;
        }
        .box p {
            margin-bottom: 10px;
        }
        .btn {
            display: inline-block;
            padding: 10px 15px;
            background: #2ecc71;
            color: #fff;
            text-decoration: none;
            border-radius: 4px;
        }
    </style>
</head>
<body>

<div class="box">
    <h2>Message reçu</h2>

    <p><strong>Date :</strong>
        <?= !empty($contact['date_creation'])
            ? date('d/m/Y H:i', strtotime($contact['date_creation']))
            : '-' ?>
    </p>

    <p><strong>Nom :</strong>
        <?= htmlspecialchars($contact['nom'] ?? '') ?>
    </p>

    <p><strong>Email :</strong>
        <?= htmlspecialchars($contact['email'] ?? '') ?>
    </p>

    <p><strong>Sujet :</strong>
        <?= htmlspecialchars($contact['sujet'] ?? '') ?>
    </p>

    <p><strong>Message :</strong><br>
        <?= nl2br(htmlspecialchars($contact['message'] ?? '')) ?>
    </p>

    <br>
    <a href="dashboard.php" class="btn">← Retour au dashboard</a>
</div>

</body>
</html>