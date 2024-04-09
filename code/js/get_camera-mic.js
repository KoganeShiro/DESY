
class Microphone {
	constructor(fftSize) {
		this.initialized = false;
		const video = document.querySelector('video');
		const canvas = document.getElementById('canvas');
		const ctx = canvas.getContext('2d');

		navigator.mediaDevices.getUserMedia({audio: true, video: true})
		.then(function(stream){
			const audioStream = new MediaStream([stream.getAudioTracks()[0]]);
			this.audioContext = new AudioContext();
			this.analyser = this.audioContext.createAnalyser();
			this.analyser.fftSize = fftSize;
			const bufferLength = this.analyser.frequencyBinCount;
			this.dataArray = new Uint8Array(bufferLength);

			this.microphone = this.audioContext.createMediaStreamSource(audioStream);
			this.microphone.connect(this.analyser);
			this.initialized = true;

			video.srcObject = stream;
			video.play();

		}.bind(this)).catch(function(err) {
			console.log(err);
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