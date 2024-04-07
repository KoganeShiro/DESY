
(function main() {

	window.distord_filter = function(options) {

		options = options || {};
		options.useMic = options.hasOwnProperty('useMic') ? options.useMic : true;

		options.cursorDisplacementSprite = options.hasOwnProperty('cursorDisplacementSprite') ? options.cursorDisplacementSprite : '';
		options.cursorImgEffect = options.hasOwnProperty('cursorImgEffect') ? options.cursorImgEffect : true;
		options.cursorScaleIntensity = options.hasOwnProperty('cursorScaleIntensity') ? options.cursorScaleIntensity : 0.25;
		options.cursorMomentum = options.hasOwnProperty('cursorMomentum') ? options.cursorMomentum : 0.14;

		options.slideImages = options.hasOwnProperty('slideImages') ? options.slideImages : [];
		options.itemsTitles = options.hasOwnProperty('itemsTitles') ? options.itemsTitles : [];
		options.backgroundDisplacementSprite = options.hasOwnProperty('backgroundDisplacementSprite') ? options.backgroundDisplacementSprite : '';
		options.swipe = options.hasOwnProperty('swipe') ? options.swipe : true;
		options.swipeDistance = options.hasOwnProperty('swipeDistance') ? options.swipeDistance : 500;
		options.slideTransitionDuration = options.hasOwnProperty('slideTransitionDuration') ? options.slideTransitionDuration : 1;
		options.transitionScaleIntensity= options.hasOwnProperty('transitionScaleIntensity') ? options.transitionScaleIntensity : 40;
		options.transitionScaleAmplitude= options.hasOwnProperty('transitionScaleAmplitude') ? options.transitionScaleAmplitude : 300;
		options.swipeScaleIntensity= options.hasOwnProperty('swipeScaleIntensity') ? options.swipeScaleIntensity : 0.3;
		options.transitionSpriteRotation= options.hasOwnProperty('transitionSpriteRotation') ? options.transitionSpriteRotation : 0;
		options.imagesRgbEffect = options.hasOwnProperty('imagesRgbEffect') ? options.imagesRgbEffect : false; 

		options.nav = options.hasOwnProperty('nav') ? options.nav : true;
		options.googleFonts = options.hasOwnProperty('googleFonts') ? options.googleFonts : ['Roboto:400'];
		options.imagesRgbIntensity = options.hasOwnProperty('imagesRgbIntensity') ? options.imagesRgbIntensity : 0.9;
		options.navImagesRgbIntensity= options.hasOwnProperty('navImagesRgbIntensity') ? options.navImagesRgbIntensity : 100;

		const fftSize = 1024; //must be a power of 2 between 2^5 and 2^15
		let mic = new Microphone(fftSize);
		if (options.useMicrophone) {
            mic = new Microphone(fftSize);
        }
		console.log(mic);

		let imgWidth = 1920;
		let imgHeight = 1080;

		// remove pixi message in console
		PIXI.utils.skipHello();

		const renderer = new PIXI.autoDetectRenderer(imgWidth,imgHeight, {
			transparent: true,
			autoResize: true,
			resolution: devicePixelRatio,
		}); 

		const canvas = document.getElementById("distord_filter");
		const stage = new PIXI.Container();
		const mainContainer = new PIXI.Container();
		const imagesContainer = new PIXI.Container();

		// displacement variables used for slides transition 
		const dispSprite = new PIXI.Sprite.from(options.backgroundDisplacementSprite );
		const dispFilter = new PIXI.filters.DisplacementFilter(dispSprite);

		// displacement variables used for cursor moving effect
		const dispSprite_2 = PIXI.Sprite.from(options.cursorDisplacementSprite);
		const dispFilter_2 = new PIXI.filters.DisplacementFilter(dispSprite_2);

		// colors filters
		const splitRgbImgs = new PIXI.filters.RGBSplitFilter;
		
		// main elements
		let render; // pixi render
		let mainLoopID;
		let slideImages;

		// slide index
		let currentIndex = 0;
		// swipping flag
		let loud_sound = false; //
		let is_swipping = false;
		let drag_start = 0;
		// transition flag
		let is_playing = false;
		// movig flag
		let is_moving = false;
		// load flag
		let is_loaded = false;

		// set some variables for mouseposition and moving effect (want it to be for sound)
		let posx = 0,
			posy = 0,
			vx = 0,
			vy = 0,
			kineX = 0,
			kineY = 0;

		// include the web-font loader script dynamically
		(function() {
			let wf = document.createElement('script');
			wf.src = (document.location.protocol === 'https:' ? 'https' : 'http') +
				'://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
			wf.type = 'text/javascript';
			wf.async = 'true';
			let s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(wf, s);
		}());


		function build_scene() {

			// append render to canvas
			canvas.appendChild(renderer.view);

			// set dispFilter to the stage
			stage.filters = [dispFilter];
			// stage.scale.set(2)

			// enable cursorInteractive on mainContainer
			mainContainer.interactive = true;
			
			// apply rgbsplit effect on imgs
			if ((options.imagesRgbEffect == true)) {

				if (options.cursorImgEffect == true) {
					imagesContainer.filters = [dispFilter_2, splitRgbImgs];
				}
				else {
					imagesContainer.filters = [splitRgbImgs];
				}
				if (options.useMicrophone) {
					// Example: Adjust displacement filter based on microphone volume
					if (mic && mic.initialized) {
						let micData = mic.getVolume(); // Get microphone volume level
						// Example: Update displacement filter scale based on microphone data
						dispFilter.scale.x = micData * 0.1; // Adjust the scale factor as needed
						dispFilter.scale.y = micData * 0.1; // Adjust the scale factor as needed
					}
				}
				
				splitRgbImgs.red = [0, 0];
				splitRgbImgs.green = [0, 0];
				splitRgbImgs.blue = [0, 0];
			}

			else {
				if (options.cursorImgEffect  == true) {
					imagesContainer.filters = [dispFilter_2];
				}
			}

			// Displacement sprites and filters set up
			dispSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
			dispFilter.autoFit = false;
			dispFilter.padding = 0;
			dispSprite_2.anchor.set(0.5);
			dispFilter_2.scale.x = 0;
			dispFilter_2.scale.y = 0;
			
			// renderer settings
			renderer.view.style.objectFit = 'cover';
			renderer.view.style.width = '100%';
			renderer.view.style.height = '100%';
			renderer.view.style.top = '50%';
			renderer.view.style.left = '50%';
			renderer.view.style.webkitTransform = 'translate( -50%, -50% ) scale(1.15)';
			renderer.view.style.transform = 'translate( -50%, -50% ) scale(1.15)';
			

			//  Add children to the main container
			mainContainer.addChild(imagesContainer, dispSprite_2);

			// Add children to the stage = canvas
			stage.addChild(mainContainer, dispSprite);

			// pixi render animation
			render = new PIXI.Ticker();
			render.autoStart = true;
			render.add(function(delta) {
				renderer.render(stage);
			});
		}

		function build_imgs() {

			for (let i = 0; i < options.slideImages.length; i++) {
				
				// get texture from image
				texture = new PIXI.Texture.from(options.slideImages[i]);
				// set sprite from texture
				imgSprite = new PIXI.Sprite(texture);

				// center img
				imgSprite.anchor.set(0.5);
				imgSprite.x = renderer.width / 2;
				imgSprite.y = renderer.height / 2;
				
				// hide all imgs
				TweenMax.set(imgSprite, {
					alpha: 0
				});

				// add img to the canvas
				imagesContainer.addChild(imgSprite);
			}

			slideImages = imagesContainer.children;
		}

		/* to be something when the sound is loud*/
		function slideTransition(next) {

			// center displacement
			dispSprite.anchor.set(0.5);
			dispSprite.x = renderer.view.width / 2;
			dispSprite.y = renderer.view.height / 2;
			
			// set timeline with callbacks
			timelineTransition = new TimelineMax({
				onStart: function() {

					// update playing flag
					is_playing = true;
					// update draging flag
					is_swipping = false;
					loud_sound = false;

					dispSprite.rotation = 0;
				},

				onComplete: function() {
					if(options.imagesRgbEffect == true) {
						splitRgbImgs.red = [0, 0];
						splitRgbImgs.green = [0, 0];
						splitRgbImgs.blue = [0, 0];
					}
					

					// update flags
					is_playing = false;
					is_swipping = false;
					loud_sound = false;

					// after the first transition
					// will prevent first animation transition
					is_loaded = true

					// set new index
					currentIndex = next;
				},

				onUpdate: function() {

					dispSprite.rotation =  options.transitionSpriteRotation; // frequency
					dispSprite.scale.set( timelineTransition.progress() * options.transitionScaleIntensity);

					if( is_loaded === true) {
						// if img rgb effect is enable
						if(options.imagesRgbEffect == true) {

							// on first half of transition
							// match splitRgb values with timeline progress / from 0 to x
							if(timelineTransition.progress() < 0.5) {
								splitRgbImgs.red = [-timelineTransition.progress() * options.navImagesRgbIntensity, 0];
								splitRgbImgs.green = [0, 0];
								splitRgbImgs.blue = [ ( timelineTransition.progress() ), 0];
							}
							
							// on second half of transition
							// match splitRgb values with timeline progress / from x to 0
							else {
								splitRgbImgs.red = [-(options.navImagesRgbIntensity - timelineTransition.progress() * options.navImagesRgbIntensity), 0];
								splitRgbImgs.green = [0, 0];
								splitRgbImgs.blue = [( (options.navImagesRgbIntensity - timelineTransition.progress() * options.navImagesRgbIntensity)), 0];

							}
						}
					}
				}
			});
			
			// make sure timeline is finish
			timelineTransition.clear();
			if (timelineTransition.isActive() ) {
				return;
			}

			var scaleAmp;

			// prevent first animation transition
			if( is_loaded === false) {
				scaleAmp = 0;
			}
			// the first transition is done > applly effect
			else {
				scaleAmp = options.transitionScaleAmplitude;
			}
			
			if( (options.itemsTitles.length > 0))  {

				timelineTransition
					.to(slideImages[currentIndex], options.slideTransitionDuration, {
							alpha: 0,
							ease: Power2.easeOut
						}, options.slideTransitionDuration * 0.5)
					.to(slideImages[next], options.slideTransitionDuration, {
							alpha: 1,
							ease: Power2.easeOut
						}, options.slideTransitionDuration * 0.5)
					.to(dispFilter.scale, options.slideTransitionDuration, {
						x: 0,
						y: 0,
						ease: Power1.easeOut
					}, options.slideTransitionDuration);
			}
			
			else {
				timelineTransition
					.to(dispFilter.scale, options.slideTransitionDuration , {
						x: scaleAmp,
						y: scaleAmp,
						ease: Power2.easeIn
					})
					.to(slideImages,  options.slideTransitionDuration, {
							alpha: 0,
							ease: Power2.easeOut
						}, options.slideTransitionDuration * 0.5)
					.to([slideImages[next]], options.slideTransitionDuration, {
							alpha: 1,
							ease: Power2.easeOut
						}, options.slideTransitionDuration * 0.5)
					.to(dispFilter.scale, options.slideTransitionDuration, {
						x: 0,
						y: 0,
						ease: Power1.easeOut
					}, options.slideTransitionDuration);
			}
		};

		function cursorInteractive() {

			// mousemove event
			// because pixi stage has a 1.15 scale factor,
			// we need to use native listener in order to get the real mouse coordinates (not affected by scale)
			window.addEventListener("mousemove", onPointerMove);
			window.addEventListener("touchmove", onTouchMove);

			// track user mouse position
			function onPointerMove(e) {
				posx = e.clientX;
				posy = e.clientY;
			}

			function onTouchMove(e) {
				posx = e.touches[0].clientX;
				posy = e.touches[0].clientY;
			}
			
			// enable raf loop
			mainLoop();
		}

		function mic_sound() {
			let micData; // Variable to store microphone data
			micData = mic.getVolume(); // Example: Get microphone volume level
		}


		function mainLoop() {
			
			// enable raf animation
			mainLoopID = requestAnimationFrame(mainLoop);

			// if user is out of screen
			 if(posy <= 0 || posx <= 0 || (posx >=  (window.innerWidth - 2 ) || posy >= (window.innerHeight - 2 ))) {

				is_moving = false;
				// re-init values
				posx = vx = window.innerWidth / 2;
				posy = vy = window.innerHeight / 2;             
				kineX = kineY = newkineX = newkineY = 0;
			}
			else {
				 is_moving = true;
			}
			// get mouse position with momentum
			vx += ((posx - vx) * options.cursorMomentum);
			vy += ((posy - vy) * options.cursorMomentum);
	
			// update kineX / kineY based on posx / posy and vx / vy
			kineX = Math.floor(posx - vx);
			kineY = Math.floor(posy - vy);


			// if flag has changed 
			if( is_moving === true ) {
				// update cursor displacement sprite positions on cursor moving
				dispSprite_2.x = vx;
				dispSprite_2.y = vy ;

				TweenMax.to(dispFilter_2.scale, 0.5, {
						x: kineX * options.cursorScaleIntensity,
						y: kineY *  options.cursorScaleIntensity,
						ease: Power4.easeOut
				});
			}

			// make background displacement follow mouse position on transition events
			if ((is_playing)) {
				dispSprite.x = vx;
				dispSprite.y = vy;
			}
	 
			// if user is swipping 
			// if (is_swipping) {
			if (loud_sound) {
				
				// update slide displacement sprite positions
				dispSprite.x = vx;
				dispSprite.y = vy;
				// move displacement filter to cursor position 
				dispFilter.x = vx;
				dispFilter.y = vy;
				// map displacement filter scale value with user swipping intensity
				dispFilter.scale.x = kineX * (options.swipeScaleIntensity);
				dispFilter.scale. y = kineY * (options.swipeScaleIntensity);

				// if img rgb effect enable
				if (options.imagesRgbEffect == true) {
					splitRgbImgs.red = [(kineX * options.imagesRgbIntensity), 0];
					splitRgbImgs.green = [0, 0];
					splitRgbImgs.blue = [(-kineX * options.imagesRgbIntensity), 0];
				} 
			}
		}

		function swipe() {

			if(options.swipe == true) {

				mainContainer
						.on('pointerdown', onDragStart)
						.on('pointerup', onDragEnd)
						.on('pointermove', onDragMove)
			
				// drag start
				//function distord(event) {
				function onDragStart(event) {
					
					if (is_playing) {
						return;
					}
					
					// get event position as data
					this.data = event.data;
					drag_start = this.data.getLocalPosition(this.parent);

					// this.drag = true;
					is_swipping = true;
					loud_sound = true;

					if(options.imagesRgbEffect == true) {
						splitRgbImgs.red = [0, 0];
						splitRgbImgs.green = [0, 0];
						splitRgbImgs.blue = [0, 0];
					}
				}
				
				// drag end
				function onDragEnd() {
					
					// make sure slide transition is not playing
					if (is_playing) {
						return;
					}

					if(options.imagesRgbEffect == true) {
						splitRgbImgs.red = [0, 0];
						splitRgbImgs.green = [0, 0];
						splitRgbImgs.blue = [0, 0];
					}

					// reset displacement filter scale value to 0
					TweenMax.to(dispFilter.scale, 0.5, {
						x: 0,
						y: 0,
						ease: Power4.easeOut
					});

					// update dispFilter position 
					TweenMax.to(dispFilter, 0.5, {
						x: vx,
						y: vy,
						ease: Power4.easeOut
					});

					// update swiping flag
					this.data = null;
					is_swipping = false;
					loud_sound = false;
				}

				// drag move > swipe
				function onDragMove() {
					
					// make sure slide transition is completed and user is swipping
					if (is_playing) {
						return;
					}

					//if (loud_sound) {
					if (is_swipping) {

						// get the new position
						let newPosition = this.data.getLocalPosition(this.parent);
						
						// if user swipe the screen from left to right : next slide
						if ((drag_start.x - newPosition.x) < - options.swipeDistance) {
							if (currentIndex >= 0 && currentIndex < options.slideImages.length - 1) {
								slideTransition(currentIndex + 1);
							} else {
								slideTransition(0);
							}
						}
						
						// if user swipe from right to left : prev slide
						if ((drag_start.x - newPosition.x) > options.swipeDistance) {
							if (currentIndex > 0 && currentIndex < options.slideImages.length) {
								slideTransition(currentIndex - 1);
							} else {
								slideTransition(options.slideImages.length - 1);
							}
						}
					}
				}
			}
		}

		
		//smoothen the animation transition
		if(options.nav == true) {

			let nav = document.querySelectorAll('.main-nav');

			for (let i = 0; i < nav.length; i++) {

				let navItem = nav[i];

				navItem.onclick = function(event) {

					// Make sure the previous transition has ended
					if (is_playing) {
						return false;
					}

					const active = document.querySelector('.active');

					if(active){
						active.classList.remove('active');
					}
					  this.classList.add('active');

					if (this.getAttribute('data-nav') === 'next') {
						if (currentIndex >= 0 && currentIndex < options.slideImages.length - 1) {
							slideTransition(currentIndex + 1);
						} else {
							slideTransition(0);
						}
					} else {
						if (currentIndex > 0 && currentIndex < options.slideImages.length) {
							slideTransition(currentIndex - 1);
						} else {
							slideTransition(options.slideImages.length - 1);
						}
					}
					return false;
				}
			}
		}


		function init() {
			
			// re init renderer on ready
			renderer.resize(imgWidth,imgHeight);

			// construct
			build_scene();
			build_imgs();

			// interactivity
			cursorInteractive();
			//sound_Interactive();
			swipe();
			slideTransition(currentIndex);
	
		};

		// Load them google fonts before starting...!
		window.WebFontConfig = {
			google: {
				families: options.googleFonts
			},

			active: function() { 
				// load the stage images 
				imagesLoaded(images, function() {
					document.body.classList.remove('loading');
					// init slider
					init();
				});
			}
		};
	};
})();
