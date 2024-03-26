
function main() {
	const canvas = document.getElementById('canvas');
	const ctx = canvas.getContext('2d');

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;


	class Box {
		constructor(x, y, width, height, color, index) {
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
			this.color = color;
			this.index = index;
		}
		update(micInput) {
			const sound = micInput * 2000;
			if (sound > this.height) {
				this.height = sound;
			} else {
				this.height -= this.height * 0.05;
			}
			
		}
		draw(context, volume) {

			context.strokeStyle = this.color;
			context.save();

			//context.translate(canvas.width/2, canvas.height/2);
			context.translate(0, 0);
			//context.rotate(this.index * 0.1);
			context.rotate(this.index * 0.03);
			context.scale(1 + volume * 0.2, 1 + volume * 0.3);

			context.beginPath();
			//context.moveTo(this.x, this.height);
			context.moveTo(this.height, this.x);
			//context.lineTo(this.x, this.y);
			context.lineTo(this.y, Math.PI * 100);

			context.stroke();
			context.strokeRect(Math.E, this.y, Math.PI, this.height);

			context.restore();
		}
	}
	
	const fftSize = 512; //must be a power of 2 between 2^5 and 2^15

	const microphone = new Microphone(fftSize);
	console.log(microphone);

	let box = [];
	let boxWidth = canvas.width / (fftSize/2);

	function createBox() {
		for (let i = 0; i < fftSize; i++) {
			let color = 'hsl('+ i * 2 +', 100%, 50%)';
			box.push(new Box(0, i, 1, 0, color, i));
			//box.push(new Box(0, i * 2, 1, 50, color, i));
		}
	}
	createBox();
	console.log(box);

	let angle = 0;

	function animate() {
		if (microphone.initialized) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			const samples = microphone.getSamples();
			const volume = microphone.getVolume();

			angle += 0.001 + (volume * 0.1);
			ctx.save();
			ctx.translate(canvas.width/2, canvas.height/2);
			ctx.rotate(angle);
			box.forEach(function(box, i) {
				box.update(samples[i]);
				box.draw(ctx, volume);
			});
			ctx.restore();
		}
		requestAnimationFrame(animate);
	}
	animate();
}