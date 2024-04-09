
distord_filter = new distord_filter({
  // backgroundDisplacementSprite: '/img/effect/2.jpg', // Not using a static image anymore
  cursorDisplacementSprite: '/img/effect/liquify.png',

  cursorImgEffect: true,
  cursorScaleIntensity: 0.65,
  cursorMomentum: 0.14,

  swipe: true,
  swipeDistance: window.innerWidth * 0.4,
  swipeScaleIntensity: 2,

  slideTransitionDuration: 1,
  transitionScaleIntensity: 200,
  transitionScaleAmplitude: 100,

  nav: true,
  navElement: '.main-nav',

  imagesRgbEffect: true,
  imagesRgbIntensity: 0.9,
  navImagesRgbIntensity: 90,
});

// Function to update the frame in the distortion filter
distord_filter.updateFrame = function(frame) {
  this.slideImages = [frame, frame]; // Update the array with the new frame
}


/*
const images = [
];

let video;
let mic = new Microphone(32);

distord_filter = new distord_filter({
	//slideImages: frames,
	slideImages: images,

	backgroundDisplacementSprite: '/img/effect/2.jpg', // slide displacement image 
	cursorDisplacementSprite: '/img/effect/liquify.png', // cursor displacement image

	/*TODO, change it to be the sound and not the cursor
	cursorImgEffect : true, // enable cursor effect
	cursorScaleIntensity : 0.65,
	cursorMomentum : 0.14, //(lower is slower)

	/* TODO change it to be the volume or the frequence of the sound 
	swipe: true, // enable swipe
	swipeDistance : window.innerWidth * 0.4, // swipe distance - ex : 580
	swipeScaleIntensity: 2, 

	slideTransitionDuration : 1, 
	transitionScaleIntensity : 200,
	transitionScaleAmplitude : 100,

	nav: true, // enable navigation
	navElement: '.main-nav', // set nav class
	
	imagesRgbEffect : true,
	imagesRgbIntensity : 0.9,
	navImagesRgbIntensity : 90,

});
*/