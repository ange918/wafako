<?php
require_once 'includes/config.php';

$message = '';
$message_type = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Récupération + sécurisation
    $name    = trim($_POST['name'] ?? '');
    $email   = trim($_POST['email'] ?? '');
    $phone   = trim($_POST['phone'] ?? '');
    $sujet   = trim($_POST['sujet'] ?? '');
    $content = trim($_POST['message'] ?? '');

    if ($name !== '' && $email !== '' && $phone !== '' && $content !== '') {

        try {
            $sql = "INSERT INTO contacts 
                    (name, email, phone, sujet, message, date_creation)
                    VALUES 
                    (:name, :email, :phone, :sujet, :message, NOW())";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':name'    => htmlspecialchars($name),
                ':email'   => htmlspecialchars($email),
                ':phone'   => htmlspecialchars($phone),
                ':sujet'   => htmlspecialchars($sujet),
                ':message' => htmlspecialchars($content)
            ]);

            $message = "Votre message a bien été envoyé. Nous vous contacterons très bientôt.";
            $message_type = 'success';

        } catch (PDOException $e) {
            $message = "Erreur lors de l'envoi : " . $e->getMessage();
            $message_type = 'error';
        }

    } else {
        $message = "Veuillez remplir tous les champs obligatoires.";
        $message_type = 'error';
    }
}
?>

<?php include 'includes/header.php'; ?>

<div class="container" style="padding-top:60px;">
    <h1 class="section-title">Contactez-nous</h1>

    <?php if ($message): ?>
        <div style="
            padding:10px;
            margin-bottom:20px;
            border-radius:5px;
            background-color: <?= $message_type === 'success' ? '#d4edda' : '#f8d7da' ?>;
            color: <?= $message_type === 'success' ? '#155724' : '#721c24' ?>;
        ">
            <?= $message ?>
        </div>
    <?php endif; ?>

    <form method="POST" action="contact.php">

        <div class="form-group">
            <label>Nom complet *</label>
            <input type="text" name="name" required>
        </div>

        <div class="form-group">
            <label>Email *</label>
            <input type="email" name="email" required>
        </div>

        <div class="form-group">
            <label>Téléphone *</label>
            <input type="text" name="phone" required>
        </div>

        <div class="form-group">
            <label>Sujet</label>
            <input type="text" name="sujet">
        </div>

        <div class="form-group">
            <label>Message *</label>
            <textarea name="message" rows="5" required></textarea>
        </div>

        <button type="submit" class="btn">Envoyer le message</button>
    </form>
</div>

<?php include 'includes/footer.php'; ?>