
// Create a new video element
const video = document.createElement('video');
video.autoplay = true;
video.muted = true;
video.style.display = 'none';
document.body.appendChild(video);

// Create a new Three.js scene
const scene = new THREE.Scene();

// Define plane material here
const planeMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(function (stream) {
	video.srcObject = stream;

	video.onloadedmetadata = function () {
	  const texture = new THREE.VideoTexture(video);
	  texture.minFilter = THREE.LinearFilter;
	  texture.magFilter = THREE.LinearFilter;
	  texture.format = THREE.RGBFormat;

	  const aspectRatio = video.videoWidth / video.videoHeight;
	  planeGeometry.scale(aspectRatio, 1, 1);

	  planeMaterial.map = texture;

	  const microphoneSource = audioContext.createMediaStreamSource(stream);
	  microphoneSource.connect(analyser);
	  analyser.fftSize = 256;
	  const bufferLength = analyser.frequencyBinCount;
	  const dataArray = new Uint8Array(bufferLength);

	  let warmPoint = {
		x: Math.random(),
		y: Math.random()
	  };

  function updateCameraImage() {
	requestAnimationFrame(updateCameraImage);

	analyser.getByteFrequencyData(dataArray);

	const previousAmplitude = updateCameraImage.previousAmplitude || 0;
	const currentAmplitude = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
	updateCameraImage.previousAmplitude = lerp(previousAmplitude, currentAmplitude, 4.2); // Smooth amplitude change

	const centerX = Math.random();
	const centerY = Math.random();

	function getDistance(x, y) {
	  const dx = x - centerX;
	  const dy = y - centerY;
	  return Math.sqrt(dx * dx + dy * dy);
	}

	const colors = [];
	for (let i = 0; i < planeGeometry.attributes.position.count; i++) {
	  const position = {
		x: planeGeometry.attributes.position.getX(i),
		y: planeGeometry.attributes.position.getY(i)
	  };

	  const distance = getDistance(position.x, position.y);

	  let colorIntensity;
	  if (currentAmplitude === 0) {
		colorIntensity = 0;
	  } else {
		colorIntensity = 1 - distance;
		colorIntensity *= Math.min(currentAmplitude / 355, 0.5);
	  }

	  const baseHue = 200; // Base hue for warmer colors
	  const maxHueChange = 350; // Maximum change in hue for warmer colors
	  const hue = baseHue - mapRange(colorIntensity, 0, 1, 0, maxHueChange);

	  const finalColor = new THREE.Color().setHSL(hue / 360, 1, 0.6);
	  colors.push(finalColor.r, finalColor.g, finalColor.b);
	}

	planeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
	planeGeometry.attributes.color.needsUpdate = true;

	renderer.render(scene, camera);
  }

  updateCameraImage.previousAmplitude = 0;

  // Helper function for linear interpolation (lerp)
  function lerp(start, end, amount) {
	return (1 - amount) * start + amount * end;
  }
	  function mapRange(value, min1, max1, min2, max2) {
		return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
	  }

	  setTimeout(updateCameraImage(), 10000);

	};
  })
  .catch(function (err) {
	console.error('Error accessing camera: ', err);
  });

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
camera.position.z = 0.5;

const planeGeometry = new THREE.PlaneBufferGeometry(1, 1, 32, 32); // Default dimensions with segments
planeGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(planeGeometry.attributes.position.count * 3), 3));

const cameraMesh = new THREE.Mesh(planeGeometry, planeMaterial);
cameraMesh.position.set(0, 0, -1);
scene.add(cameraMesh);

// Create a new renderer
const renderer = new THREE.WebGLRenderer({
	antialias: false,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Style the renderer canvas for centering
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0'; // Position at top
renderer.domElement.style.left = '0'; // Position at left