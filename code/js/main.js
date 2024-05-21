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
    audioContext,
    streamDestination,
    sourceNode,
    audioTrack,
    video,
    animationFrameId;


function createAndStartAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        if (audioContext.state === 'suspended') {
            document.addEventListener('click', function() {
                audioContext.resume().then(() => {
                    console.log('AudioContext resumed successfully.');
                }).catch((error) => {
                    console.error('Failed to resume AudioContext:', error);
                });
            }, { once: true });
        }
    }
}

function useWebcam() {
    video = document.createElement('video');
    video.loop = true;
    navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: 'environment' } },
        audio: true,
    })
    .then(handleStream)
    .catch(handleError);

    function handleStream(stream) {
        var newStream = new MediaStream(stream.getVideoTracks());
        video.srcObject = newStream;
        if (!onlyPlayWhenRecording) {
            video.play();
        }

        audioTrack = stream.getAudioTracks()[0] || null;
        renderer.useInput(video, true);
        
    }

    function handleError(error) {
        console.warn('Environment camera failed, using user-facing camera:', error);

        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        })
        .then(handleStream)
        .catch(function (error) {
            console.warn('User-facing camera failed:', error);
            alert('Cannot open the camera on your device, try changing browser');
        });
    }
}

function loop() {
    renderer.render();
    frameCount++;

    if (capturer) {
        capturer.capture(renderer.tRenderer.domElement);
        precisionRecorderFrames++;

        if (precisionRecorderAutoStop) {
            console.log(precisionRecorderFrames * (1 / precisionRecorderFramerate));
            if (precisionRecorderFrames * (1 / precisionRecorderFramerate) >= precisionRecorderAutoStop) {
                stopRecording();
                document.getElementById('record-button').style.color = '#00f';
            }
        }
    }

    animationFrameId = requestAnimationFrame(loop);
}

document.getElementById('play-button').addEventListener('click', function () {
    createAndStartAudioContext();
    useWebcam();
    renderer = new Renderer();
    interface = new Interface(renderer, audioContext);
    loop();

    document.getElementById('play-button').style.display = 'none';
});

document.getElementById('container').addEventListener('click', function () {
    console.log("click in container");
    cancelAnimationFrame(animationFrameId);

    if (video) {
        video.pause();
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }

    if (renderer && renderer.tRenderer && renderer.tRenderer.domElement) {
        const domElement = renderer.tRenderer.domElement;
        if (domElement.parentNode) {
            domElement.parentNode.removeChild(domElement);
        }
    }

    document.getElementById('play-button').style.display = 'block';
});

document.addEventListener('DOMContentLoaded', function() {
    var photoButton = document.getElementById('photo-button');
    var recordButton = document.getElementById('record-button');

    if (photoButton) {
        photoButton.addEventListener('click', function () {
            var url = renderer.tRenderer.domElement.toDataURL('image/png');
            var a = document.createElement('a');

            console.log("photo taken");
            a.href = url;
            a.download = 'DESY-' + '.png';
            a.click();
        });
    } else {
        console.error('photoButton not found');
    }
/*
    if (recordButton) {
        recordButton.addEventListener('mousedown', function () {
            console.log("recording started");
            if (startRecording()) {
                recordButton.style.color = '#f00';
            }
        });

        recordButton.addEventListener('mouseup', function () {
            console.log("recording stopped");
            stopRecording();
            recordButton.style.color = '#000006';
        });

        recordButton.addEventListener('mouseleave', function () {
            if (recording) {
                console.log("recording stopped");
                stopRecording();
                recordButton.style.color = '#000006';
            }
        });
*/
	if (recordButton) {
        recordButton.addEventListener('click', function () {
            if (!recording) {
                console.log("recording");
                if (startRecording()) {
                    recordButton.style.color = '#f00';
                    return;
                }
            } else {
                console.log("finish recording");
                stopRecording();
            }

            recordButton.style.color = '#000006';
        });
    } else {
        console.error('recordButton not found');
    }
});


function startRecording() {
	var stream, audioTracks, chosenMime = null,
		mimeTypes = [
			'video/mp4',
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
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
			a.download = 'DESY-video.mp4';
			a.click();

			mediaRecorder = false;

			setTimeout(function () {
				window.URL.revokeObjectURL(url);
			}, 100);
		}
	}
}
