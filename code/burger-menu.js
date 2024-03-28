
function showSidebar() {
    console.log("show sidebar");

    const closeButtons = document.querySelectorAll('.close-button');
    const menuButton = document.querySelector('.menu-button');
    const sidebar = document.querySelector('.sidebar');

    sidebar.classList.add('sidebar-open');
    sidebar.style.display = 'flex';
    menuButton.style.display = 'none';
    closeButtons.forEach(function(button) {
        button.style.display = 'flex';
    });
}

function hideSidebar() {
    console.log("hide sidebar");

    const closeButtons = document.querySelectorAll('.close-button');
    const menuButton = document.querySelector('.menu-button');
    const sidebar = document.querySelector('.sidebar');

    sidebar.classList.remove('sidebar-open');
    menuButton.style.display = 'flex';
    closeButtons.forEach(function(button) {
        button.style.display = 'none';
    });
}
