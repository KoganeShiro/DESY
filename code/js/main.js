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
        video: true,
        audio: true
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
        prompt.innerHTML = 'Unable to capture WebCam. Please reload the page.';
    });
}

useWebcam();



/*
function updatePanelValues(newValues) {
    const valueElements = document.querySelectorAll('.panel-value'); // Adjust selector as needed

    valueElements.forEach((element, index) => {
      const newValue = newValues[index];
      if (newValue !== undefined) {
        element.textContent = newValue.toFixed(3); // Update the content of the span element, rounded to 3 decimal places
      }
    });
  }

  // Replace mouse interaction logic with calls to updatePanelValues

  // Function to capture microphone input and update panel values based on volume
  function captureMicrophoneInput() {
    const mediaStreamSource = audioContext.createMediaStreamSource(streamDestination.stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    mediaStreamSource.connect(analyser);

    function updateValues() {
      analyser.getByteFrequencyData(dataArray);

      // Calculate average volume level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const averageVolume = sum / bufferLength;

      // Map average volume to new values for the panels
      const newStrength = averageVolume / 255; // Normalize to a range of [0, 1]
      const newSize = averageVolume * 0.12; // Adjust multiplier as needed
      const newSpeed = averageVolume * 0.0001; // Adjust multiplier as needed

      // Update the panel bar values
      updatePanelValues([newStrength, newSize, newSpeed]);

      // Schedule the next update
      requestAnimationFrame(updateValues);
    }

    // Start updating values
    updateValues();
  }

  // Call the microphone capture function
  captureMicrophoneInput();
*/




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
    //audio = new Audio();

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
