<?php
$host = 'localhost';
$dbname = 'wafako';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // En production, ne pas afficher l'erreur brute
    // die("Erreur de connexion : " . $e->getMessage());
    $pdo = null; // Pour éviter les erreurs si la base n'existe pas encore
}
?>
