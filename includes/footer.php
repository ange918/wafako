<footer>
    <div class="container">
        <div class="grid">
            <div>
                <h3>Wa Fa KO</h3>
                <p>Découvrez nos boissons authentiques et rafraîchissantes.</p>
            </div>
            <div>
                <h3>Liens Rapides</h3>
                <ul>
                    <li><a href="index.php">Accueil</a></li>
                    <li><a href="boissons.php">Boissons</a></li>
                    <li><a href="contact.php">Contact</a></li>
                </ul>
            </div>
            <div>
                <h3>Contact</h3>
                <p>Email: info@wafako.com</p>
                <p>Tél: +123 456 7890</p>
            </div>
        </div>
        <div style="margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
            <p>&copy; <?php echo date('Y'); ?> Wa Fa KO. Tous droits réservés.</p>
        </div>
    </div>
</footer>

<a href="https://wa.me/1234567890" class="whatsapp-float" target="_blank">
    <i class="fab fa-whatsapp"></i>
</a>

<script>
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
</script>

</body>
</html>
