<?php
session_start();
require_once '../includes/config.php';

// Sécurité admin
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: login.php");
    exit;
}

$contacts = [];
if ($pdo) {
    try {
        $stmt = $pdo->query("SELECT * FROM contacts ORDER BY date_creation DESC");
        $contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $contacts = [];
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Dashboard - Wa Fa KO</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .admin-header {
            background: #2c3e50;
            color: #fff;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
        }
        th, td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #333;
            color: #fff;
        }
        .btn-action {
            padding: 5px 10px;
            font-size: 12px;
            text-decoration: none;
            border-radius: 4px;
            margin-right: 5px;
        }
        .btn-view { background: #3498db; color: #fff; }
        .btn-delete { background: #e74c3c; color: #fff; }
    </style>
</head>
<body>

<div class="admin-header">
    <h2><i class="fas fa-tachometer-alt"></i> Dashboard Wa Fa KO</h2>
    <div>
        Bonjour, <?= htmlspecialchars($_SESSION['admin_user'] ?? 'Admin') ?>
        <a href="logout.php" style="color:#fff; margin-left:15px;">Déconnexion</a>
    </div>
</div>

<div style="padding:40px;">
    <h3>Messages reçus</h3>

    <?php if (empty($contacts)): ?>
        <p>Aucun message.</p>
    <?php else: ?>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Sujet</th>
                    <th>Message</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
            <?php foreach ($contacts as $contact): ?>
                <tr>
                    <td>
                        <?= !empty($contact['date_creation']) 
                            ? date('d/m/Y H:i', strtotime($contact['date_creation'])) 
                            : '-' ?>
                    </td>
                    <td><?= htmlspecialchars($contact['nom'] ?? '') ?></td>
                    <td><?= htmlspecialchars($contact['email'] ?? '') ?></td>
                    <td><?= htmlspecialchars($contact['sujet'] ?? '') ?></td>
                    <td><?= htmlspecialchars(substr($contact['message'] ?? '', 0, 50)) ?>...</td>
                    <td>
                        <a class="btn-action btn-view"
                           href="view_contact.php?id=<?= (int)($contact['id'] ?? 0) ?>">
                            Voir
                        </a>
                        <a class="btn-action btn-delete"
                           href="delete_contact.php?id=<?= (int)($contact['id'] ?? 0) ?>"
                           onclick="return confirm('Supprimer ce message ?');">
                            Supprimer
                        </a>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    <?php endif; ?>
</div>

</body>
</html>