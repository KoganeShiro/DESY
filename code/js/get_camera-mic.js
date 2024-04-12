
class Microphone {
    constructor(fftSize) {
        this.initialized = false;
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then(function(stream) {
                const audioStream = new MediaStream([stream.getAudioTracks()[0]]);
                this.audioContext = new AudioContext();
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = fftSize;
                const bufferLength = this.analyser.frequencyBinCount;
                this.dataArray = new Uint8Array(bufferLength);

                this.microphone = this.audioContext.createMediaStreamSource(audioStream);
                this.microphone.connect(this.analyser);
                this.initialized = true;

                rawVideoStream = stream; // global reference
                videoSettings = stream.getVideoTracks()[0].getSettings();
                console.log("videoSettings: width=%d, height=%d, frameRate=%d", videoSettings.width, videoSettings.height, videoSettings.frameRate);
                audioTrack = stream.getAudioTracks()[0];

				let videoElement = document.createElement("video");
				Object.assign(videoElement, {
					srcObject: stream,
					width: videoSettings.width,
					height: videoSettings.height,
					autoplay: true,
					muted: true,
				})

				gui.add(videoElement, "muted");

                videoTexture = new THREE.VideoTexture(videoElement);
                videoTexture.minFilter = THREE.LinearFilter;

                init();
            }.bind(this))
            .catch(function(err) {
                console.log(err);
                alert("You can't experiment if you don't activate your camera and your mic !...");
            });
    }

    getSamples() {
        this.analyser.getByteTimeDomainData(this.dataArray);
        let normSamples = [...this.dataArray].map(e => e / 128 - 1);
        return normSamples;
    }

    getVolume() {
        this.analyser.getByteTimeDomainData(this.dataArray);
        let normSamples = [...this.dataArray].map(e => e / 128 - 1);
        let sum = 0;
        for (let i = 0; i < normSamples.length; i++) {
            sum += normSamples[i] * normSamples[i];
        }
        let volume = Math.sqrt(sum / normSamples.length);
        return volume;
    }

	/*
	getFrequency() {
		this.analyser.getFloatFrequencyData(this.dataArray);
	
		// Find the index of the frequency bin with the highest amplitude
		let dominantFrequencyIndex = 0;
		let maxAmplitude = 0;
		for (let i = 0; i < this.dataArray.length; i++) {
		  if (this.dataArray[i] > maxAmplitude) {
			maxAmplitude = this.dataArray[i];
			dominantFrequencyIndex = i;
		  }
		}
	
		// Calculate the dominant frequency based on sample rate and frequency bin count
		const sampleRate = this.audioContext.sampleRate;
		const frequencyBinCount = this.analyser.frequencyBinCount;
		const dominantFrequency = sampleRate / frequencyBinCount * dominantFrequencyIndex;
	
		return dominantFrequency;
	  }
	  */
}