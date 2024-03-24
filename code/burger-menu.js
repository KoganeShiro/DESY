document.addEventListener('DOMContentLoaded', function() {
    var burgerMenuButton = document.querySelector('.burger-menu-button');
    var burgerMenu = document.querySelector('.burger-menu');

    burgerMenuButton.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent the click event from bubbling up

        // Toggle the display of menu items
        var menuItems = burgerMenu.querySelectorAll('li');
        menuItems.forEach(function(item) {
            item.style.display = (item.style.display === 'flex') ? 'none' : 'flex';
        });

        // Add event listener to hide menu when clicking outside
        document.addEventListener('click', function hideMenu(event) {
            if (!burgerMenu.contains(event.target)) {
                menuItems.forEach(function(item) {
                    item.style.display = 'none';
                });
                document.removeEventListener('click', hideMenu); // Remove the event listener after hiding the menu
            }
        });
    });
});
