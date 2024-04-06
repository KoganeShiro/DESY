
const images = [
    "/img/gallery-test/lh.jpg",
    "/img/gallery-test/lh.jpg",
];

rgbKineticSlider = new rgbKineticSlider({
    slideImages: images, // array of images > must be 1920 x 1080

    backgroundDisplacementSprite: '/img/effect/1.jpg', // slide displacement image 
    cursorDisplacementSprite: '/img/effect/liquify.png', // cursor displacement image

    cursorImgEffect : true, // enable cursor effect
    cursorScaleIntensity : 0.65, // MAY CHANGE
    cursorMomentum : 0.14, // MAY CHANGE (lower is slower)

    swipe: true, // enable swipe
    swipeDistance : window.innerWidth * 0.4, // swipe distance - ex : 580
    swipeScaleIntensity: 2, // MAY CHANGE

    slideTransitionDuration : 1, //  MAY CHANGE
    transitionScaleIntensity : 30, //  MAY CHANGE
    transitionScaleAmplitude : 160, //  MAY CHANGE

    nav: false, // enable navigation
    navElement: '.main-nav', // set nav class
    
    imagesRgbEffect : true, // enable img rgb effect
    imagesRgbIntensity : 0.9, //  MAY CHANGE
    navImagesRgbIntensity : 90, //  MAY CHANGE

});