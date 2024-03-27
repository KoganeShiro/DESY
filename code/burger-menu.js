
function showSidebar() {
    var sidebar = document.querySelector('.burger-menu');
    sidebar.style.display = 'flex';
    //sidebar.classList.toggle('active');
}

function hideSidebar() {
    const sidebar = document.querySelector('.burger-menu');
    sidebar.style.display = 'none';
}