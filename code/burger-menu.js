
document.addEventListener('DOMContentLoaded', function() {
    var burgerMenuButton = document.querySelector('.burger-menu-button');
    var burgerMenu = document.querySelector('.burger-menu');

    // Toggle the burger menu when clicking the burger menu button
    burgerMenuButton.addEventListener('click', function() {
        console.log('Burger menu button clicked');
        burgerMenu.classList.toggle('open');
    });    
});
