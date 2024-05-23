
function Interface(renderer, audioContext) {
	var self = this,
		controlsBox = document.getElementById('controls'),
		// panelsBox = document.getElementById('panels'),

		//filtersBox = document.getElementById('filters'),

		activeControl = null;

	self.updateSlider = function (control) {
		var value = control.value,
			min = control.min,
			max = control.max,
			percent = (value - min) / (max - min),
			controlsWidth = controlsBox.offsetWidth;

		control.innerLabel.style.width = controlsWidth;


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

					});
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

	function updateControlValues(audioContext) {
		console.log("in distord-with-sound", audioContext);
		//var audioContext = new (window.AudioContext || window.webkitAudioContext);
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
		alert('Cannot open the mic on your device, cannot proceed to the effect');
	});

	}
	

	createPanels();
	updateControlValues(audioContext);

	setupFilter();

}