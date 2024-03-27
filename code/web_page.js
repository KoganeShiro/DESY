
//motion design

document.addEventListener("DOMContentLoaded", function() {
    var mediaElements = document.querySelectorAll('.anim-logo');

    setTimeout(function(){
         mediaElements.forEach(function(element) {
            element.style.opacity = '1';
        });
    }, 10);
    
    setTimeout(function(){
        mediaElements.forEach(function(element) {
            element.style.opacity = '0';
            element.parentElement.style.zIndex = 'auto';
         });
    }, 800);

});
