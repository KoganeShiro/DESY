
const images = [
	"/img/gallery-test/boat.jpg",
	"/img/gallery-test/boat.jpg",
];

function updateSliderWithCamera() {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const video = document.getElementById('camera');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Draw current frame from video stream onto canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert canvas to base64 image data
  const imageData = canvas.toDataURL();

  distord_filter.updateSlide(imageData);

  requestAnimationFrame(updateSliderWithCamera);
}

distord_filter = new distord_filter({
	/*TODO videoImages = frames*/
	slideImages: images,

	backgroundDisplacementSprite: '/img/effect/2.jpg', // slide displacement image 
	cursorDisplacementSprite: '/img/effect/liquify.png', // cursor displacement image

	/*TODO, change it to be the sound and not the cursor*/
	cursorImgEffect : true, // enable cursor effect
	cursorScaleIntensity : 0.65,
	cursorMomentum : 0.14, //(lower is slower)
	/**/

	/* TODO change it to be the volume or the frequence of the sound */
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
