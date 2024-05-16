var renderer,
	interface,

	fpsBox,
	frameCount = 0,

	filterIndex = 2,
	Filters = ['Wiggle', WarpFilter],


	mediaRecorder,
	recording = false,

	precisionRecorderActive = false,
	precisionRecorderFramerate = 25,
	precisionRecorderAutoStop = 0,
	precisionRecorderFrames = 0,
	capturer,

	onlyPlayWhenRecording = false,

	audioContext = new (window.AudioContext || window.webkitAudioContext)(),
	streamDestination,
	sourceNode,
	audioTrack;

function useWebcam() {
	var video = document.createElement('video');

	video.loop = true;

	navigator.mediaDevices.getUserMedia({
		video: {
			facingMode:  {exact: 'environment'}, 
		  },
		audio: true,
	  })
	.then(function (stream) {
		var newStream = new MediaStream(stream.getVideoTracks()),
			audioTracks = stream.getAudioTracks();

		cleanupAudio();

		video.srcObject = newStream;
		if (!onlyPlayWhenRecording) {
			video.play();
		}

		if (audioTracks && audioTracks.length) {
			audioTrack = audioTracks[0];
		}

		renderer.useInput(video, true);
	})
	.catch(function (error) {
		prompt.innerHTML = 'Unable to capture back WebCam.';
		console.warn('Environment camera failed, using user-facing camera:', error);
	});
	navigator.mediaDevices.getUserMedia({
		video: true,
		audio: true,
	  })
	.then(function (stream) {
		var newStream = new MediaStream(stream.getVideoTracks()),
			audioTracks = stream.getAudioTracks();

		cleanupAudio();

		video.srcObject = newStream;
		if (!onlyPlayWhenRecording) {
			video.play();
		}

		if (audioTracks && audioTracks.length) {
			audioTrack = audioTracks[0];
		}

		renderer.useInput(video, true);
	})
	.catch(function (error) {
		prompt.innerHTML = 'Unable to capture front WebCam.';
		console.warn('Environment camera failed', error);
	});
}

useWebcam();



function loop() {
	renderer.render();

	frameCount ++;

	if (capturer) {
		capturer.capture(renderer.tRenderer.domElement);
		precisionRecorderFrames ++;

		if (precisionRecorderAutoStop) {
			console.log(precisionRecorderFrames * (1 / precisionRecorderFramerate));
			if (precisionRecorderFrames * (1 / precisionRecorderFramerate) >= precisionRecorderAutoStop) {
				stopRecording();
				document.getElementById('record-button').style.color = '#00f';
			}
		}
	}

	requestAnimationFrame(loop);
}

window.addEventListener('load', function () {

	renderer = new Renderer();
	interface = new Interface(renderer);
	loop();

});

function cleanupAudio() {
	if (sourceNode) {
		sourceNode.disconnect();
	}

	sourceNode = null;
	audioTrack = null;
}



function startRecording() {
	var options, stream, audioTracks, chosenMime = null,
		mimeTypes = [
			'video/mp4',
			'video/webm',
		];

	if (mediaRecorder) mediaRecorder.stop();

	if (precisionRecorderActive) {
		startPrecisionRecording();

		return true;
	}
	else {
		if (MediaRecorder) {
			mimeTypes.reverse().forEach(function (mime) {
				if (MediaRecorder.isTypeSupported(mime)) {
					chosenMime = mime;
				}
			});

			if (chosenMime) {
				console.log(chosenMime);

				stream = renderer.tRenderer.domElement.captureStream(24);

				if (audioTrack) {
					stream.addTrack(audioTrack);
				}
				else if (renderer.input.tagName == 'VIDEO') {
					streamDestination = audioContext.createMediaStreamDestination();

					if (!sourceNode) {
						sourceNode = audioContext.createMediaElementSource(renderer.input);
						sourceNode.connect(audioContext.destination);
					}

					sourceNode.connect(streamDestination);

					audioTracks = streamDestination.stream.getAudioTracks();

					if (audioTracks && audioTracks.length) {
						stream.addTrack(audioTracks[0]);
					}
				}

				mediaRecorder = new MediaRecorder(
					stream,
					{
						mimeType: chosenMime,
						videoBitsPerSecond : 2500000 * 2,
					}
				);

				if (onlyPlayWhenRecording && renderer.input.tagName == 'VIDEO') {
					renderer.input.play();
				}
				mediaRecorder.start();
				recording = true;

				return true;
			}
			else {
				alert('Hmm. Looks like your browser doesn\'t support recording... Try Chrome.');
				return false;
			}
		}
		else {
			alert('Hmm. Looks like your browser doesn\'t support recording... Try Chrome.');
			return false;
		}
	}
}

function stopRecording() {
	if (capturer) {
		capturer.stop();
		recording = false;

		if (onlyPlayWhenRecording && renderer.input.tagName == 'VIDEO') {
			renderer.input.pause();
		}

		capturer.save();

		capturer = null;
	}
	else if (mediaRecorder) {

		mediaRecorder.stop();
		recording = false;

		if (sourceNode) {
			sourceNode.disconnect(streamDestination);
			streamDestination = null;
		}

		mediaRecorder.ondataavailable = function (event) {
			var url = URL.createObjectURL(event.data),
				a = document.createElement('a');

			a.href = url;
			a.download = 'DESY video';
			a.click();

			mediaRecorder = false;

			setTimeout(function () {
				window.URL.revokeObjectURL(url);
			}, 100);
		}
	}
}
