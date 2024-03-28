
window.onload = function() {
    var constraints = { audio: true, video: true };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(mediaStream) {
            var video = document.querySelector('video');
            video.srcObject = mediaStream;
            video.play();
        })
        .catch(function(err) {
            alert(err);
        });
}

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
			alert("You can't experiment if you don't activate your camera and your mic !...");
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
