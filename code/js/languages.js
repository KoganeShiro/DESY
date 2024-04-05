
//TODO language menu display when i don't click on it

document.addEventListener('DOMContentLoaded', function() {
    var langButton = document.getElementById('langButton');
    var langOptions = document.getElementById('langOptions');

    langButton.addEventListener('click', function() {
        // Toggle display of language options
        langOptions.style.display = (langOptions.style.display === 'block') ? 'none' : 'block';
    });

    // Hide language options when clicking outside the language menu
    document.addEventListener('click', function(event) {
        if (!langButton.contains(event.target) && !langOptions.contains(event.target)) {
            langOptions.style.display = 'none';
        }
    });
});
