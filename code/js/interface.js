function Interface(renderer) {
	var self = this,
		controlsBox = document.getElementById('controls'),
		panelsBox = document.getElementById('panels'),

		//filtersBox = document.getElementById('filters'),

		photoButton = document.getElementById('photo-button'),
		recordButton = document.getElementById('record-button'),
	
		activeControl = null;

	self.updateSlider = function (control) {
		var value = control.value,
			min = control.min,
			max = control.max,
			percent = (value - min) / (max - min),
			controlsWidth = controlsBox.offsetWidth,

			text; //strength, size, speed

		control.innerLabel.style.width = controlsWidth;

		if (control.format) {
			text = control.format(control.value);
		}
		else if (control.labels) {
			text = control.name + ': ' + control.labels[control.value];
		}
		else {
			text = control.name + ': ' + control.value.toFixed(3);
		}

		control.innerLabel.innerHTML = text;
		control.outerLabel.innerHTML = text;

		control.inner.style.width = parseInt(percent*controlsWidth) + 'px';

		if (control.uniform) {
			control.parentFilter.uniforms[control.uniform].value = control.value;
		}

		if (control.disabled) {
			control.outer.style.opacity = .3;
		}
		else {
			control.outer.style.opacity = 1;
		}
	}

	function handleMouse(event) {
		var percent,
			newValue,
			mouseX = event.pageX;

		event.preventDefault();

		if (activeControl) {
			percent = (mouseX - activeControl.outer.offsetLeft) / activeControl.outer.offsetWidth;
			newValue = ((activeControl.max - activeControl.min) * percent) + activeControl.min;

			if (activeControl.step) {
				newValue = Math.round(newValue/activeControl.step) * activeControl.step;
			}

			if (newValue < activeControl.min) newValue = activeControl.min;
			else if (newValue > activeControl.max) newValue = activeControl.max;

			activeControl.value = newValue;

			self.updateSlider(activeControl);

			if (activeControl.onChange) {
				activeControl.onChange();
			}
		}
	};

	function createPanels() {
		renderer.filters.forEach(function (filter) {
			var panel;

			if (filter.panel) {
				return;
			}

			panel = createElement('div', {className: 'panel'}),

			filter.panel = panel;

			if (!filter.controls) return;

			Object.keys(filter.controls).forEach(function (key) {
				var control = filter.controls[key],
					element,
					outer,
					inner,
					outerLabel,
					innerLabel;

				control.name = key;
				element = createElement('div', {className: 'control'});

				if (control.type == 'slider') {
					outer = createElement('div', {className: 'slider-outer'});
					inner = createElement('div', {className: 'slider-inner'});
					outerLabel = createElement('label');
					innerLabel = createElement('label');

					inner.appendChild(innerLabel);
					outer.appendChild(outerLabel);

					outer.appendChild(inner);
					element.appendChild(outer);

					control.outer = outer;
					control.inner = inner;
					control.innerLabel = innerLabel;
					control.outerLabel = outerLabel;
					control.parentFilter = filter;

					self.updateSlider(control);

					outer.addEventListener('mousedown', function (event) {
						event.preventDefault();

						if (control.disabled) return;

						startMouseX = event.pageX;
						startMouseY = event.pageY;
						startValue = control.value;
						activeControl = control;

						handleMouse(event);
					});
				}
				else if (control.type == 'button') {
					inner = createElement('a', {className: 'button'});
					inner.innerHTML = control.name;

					inner.addEventListener('mousedown', function (event) {
						event.preventDefault();
					});
					inner.addEventListener('click', function (event) {
						event.preventDefault();

						control.action();
					});

					element.appendChild(inner);
				}

				panel.appendChild(element);
			});
		});
	}

	function setupFilter() {
		var pair = Filters, //make a list if there is more effect
			filter = new pair[1](renderer);

		renderer.filters = [filter];

		createPanels();

	}

	function updateControlValues() {
		var audioContext = new (window.AudioContext || window.webkitAudioContext);
		const analyser = audioContext.createAnalyser();
		analyser.fftSize = 256;
	
		navigator.mediaDevices.getUserMedia({ audio: true })
			.then(function(stream) {
				const source = audioContext.createMediaStreamSource(stream);
				source.connect(analyser);
	
				const bufferLength = analyser.frequencyBinCount;
				const dataArray = new Uint8Array(bufferLength);
	
				function processAudio() {
					analyser.getByteFrequencyData(dataArray);
	
					// Calculate audio intensity based on frequency data
					let audioIntensity = 0;
					for (let i = 0; i < bufferLength; i++) {
						audioIntensity += dataArray[i];
					}
					audioIntensity /= bufferLength;


					// Update control values based on audio intensity
					renderer.filters.forEach(function (filter) {
						if (filter.controls) {
							Object.keys(filter.controls).forEach(function (key) {
								const control = filter.controls[key];
								let newValue;
								switch (key) {
									case 'Strength':
										newValue = audioIntensity * 0.003;
										break;
									case 'Size':
										newValue = audioIntensity * 0.6;
										break;
									case 'Speed':
										newValue = audioIntensity * 0.00055;
										break;
									default:
										return;
								}
								control.value = Math.min(newValue, control.max);
								self.updateSlider(control);
								});
						}
					});
	
					requestAnimationFrame(processAudio);
				}
	
				processAudio();
			})
			.catch(function(err) {
				console.error('Error accessing microphone:', err);
			});
	}
	

	createPanels();
	updateControlValues();

	setupFilter();

	document.addEventListener('mousemove', handleMouse);




	recordButton.addEventListener('click', function () {
			if (!recording) {
				console.log("recording");
				if (startRecording()) {
					recordButton.style.color = '#f00';
					return;
				}
			}
			else {
				console.log("finish recording");
				stopRecording();
			}

			recordButton.style.color = '#000006';
	});

	photoButton.addEventListener('click', function () {
		var url = renderer.tRenderer.domElement.toDataURL('image/png'),
			a = document.createElement('a');

			console.log("photo taken");
			a.href = url;
			a.download = 'DESY-' + '.png';
			a.click();
	});

}