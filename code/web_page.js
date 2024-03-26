//https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

class Microphone {
	constructor(fftSize) {
		this.initialized = false;
		navigator.mediaDevices.getUserMedia({audio: true, video: true})
		.then(function(stream){
			this.audioContext = new AudioContext();
			this.microphone = this.audioContext.createMediaStreamSource(stream);
			this.analyser = this.audioContext.createAnalyser();
			this.analyser.fftSize = fftSize;
			const bufferLength = this.analyser.frequencyBinCount;
			this.dataArray = new Uint8Array(bufferLength);
			this.microphone.connect(this.analyser);
			this.initialized = true;
		}.bind(this)).catch(function(err) {
			alert(err);
		});
	}
	getSamples() {
		this.analyser.getByteTimeDomainData(this.dataArray);
		let normSamples = [...this.dataArray].map(e => e/128 - 1);
		return normSamples;
	}
	getVolume() {
		this.analyser.getByteTimeDomainData(this.dataArray);
		let normSamples = [...this.dataArray].map(e => e/128 - 1);
		let sum = 0;
		for (let i = 0; i < normSamples.length; i++) {
			sum += normSamples[i] * normSamples[i];
		}
		let volume = Math.sqrt(sum / normSamples.length);
		return volume;
	}
}




/*
invert the color of the video

window.onload = function() {
    var constraints = { audio: true, video: true };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(mediaStream) {
            var video = document.createElement('video');
            video.srcObject = mediaStream;
            video.play();

            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');

            video.addEventListener('loadedmetadata', function() {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                document.body.appendChild(canvas);

                function processFrame() {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    var data = imageData.data;
                    for (var i = 0; i < data.length; i += 4) {
                        data[i] = 255 - data[i]; // Red
                        data[i + 1] = 255 - data[i + 1]; // Green
                        data[i + 2] = 255 - data[i + 2]; // Blue
                        // data[i + 3] is the alpha channel; we leave it unchanged
                    }
                    ctx.putImageData(imageData, 0, 0);
                    requestAnimationFrame(processFrame);
                }

                processFrame();
            });
        })
        .catch(function(err) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                console.log("User denied access to camera and microphone");
            } else {
                console.log("An error occurred: " + err.message);
            }
        });
}
*/