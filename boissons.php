<?php include 'includes/header.php'; ?>

<div class="container" style="padding-top: 60px;">
    <h1 class="section-title">Nos Boissons</h1>
    <p style="text-align: center; margin-bottom: 40px;">Une sélection rigoureuse pour tous les goûts.</p>
    
    <div class="grid">
        <!-- En PHP réel, on pourrait boucler sur la base de données ici -->
        <?php
        // Exemple de boucle si DB connectée
        /*
        if ($pdo) {
            $stmt = $pdo->query("SELECT * FROM produits");
            while ($row = $stmt->fetch()) {
                echo '<div class="card">...</div>';
            }
        }
        */
        ?>
        
        <div class="card">
            <img src="https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80" alt="Jus 1">
            <h3>Jus de Bissap</h3>
            <p>Rafraîchissant et riche en vitamine C. La fleur d'hibiscus à l'honneur.</p>
        </div>
        
        <div class="card">
            <img src="https://images.unsplash.com/photo-1527661591475-527312dd65f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=658&q=80" alt="Jus 2">
            <h3>Jus de Gingembre</h3>
            <p>Un goût puissant et énergisant, parfait pour commencer la journée.</p>
        </div>
        
        <div class="card">
            <img src="https://images.unsplash.com/photo-1560526860-f856d4f3d58a?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80" alt="Jus 3">
            <h3>Bouye (Pain de Singe)</h3>
            <p>Onctueux et nutritif, le fruit du baobab transformé en délice.</p>
        </div>
        
        <div class="card">
            <img src="https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Jus 4">
            <h3>Cocktail Vitaminé</h3>
            <p>Orange, carotte et citron pour un boost d'immunité.</p>
        </div>
    </div>
</div>

<?php include 'includes/footer.php'; ?>
