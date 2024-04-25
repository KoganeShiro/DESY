
// Create a new Three.js scene
const scene = new THREE.Scene();

// Create a new camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create a new renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Style the renderer canvas for centering
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0'; // Position at top
renderer.domElement.style.left = '0'; // Position at left

// Create a plane geometry to represent the camera view
const planeGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 'white' }); // Use white for a clear camera feed
const cameraMesh = new THREE.Mesh(planeGeometry, planeMaterial);
cameraMesh.position.set(0, 0, -1);
scene.add(cameraMesh);

// Capture camera feed as texture
const video = document.createElement('video');
video.width = window.innerWidth;
video.height = window.innerHeight;
video.autoplay = true;
video.muted = true;
// Hide the video element (optional)
video.style.display = 'none';
document.body.appendChild(video);

// Process microphone input to modify camera image
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
navigator.mediaDevices.getUserMedia({ video: true, audio: true }) // Request both video and audio tracks
    .then(function(stream) {
        video.srcObject = stream;

        // Apply the video texture once the video metadata is loaded
        video.onloadedmetadata = function() {
            const texture = new THREE.VideoTexture(video);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.format = THREE.RGBFormat;

            // Apply the video texture to the plane material
            planeMaterial.map = texture;

            const microphoneSource = audioContext.createMediaStreamSource(stream);
            microphoneSource.connect(analyser);
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            // Modify camera image based on microphone input
            function updateCameraImage() {
                requestAnimationFrame(updateCameraImage);

                analyser.getByteFrequencyData(dataArray);

                // Simple example: modify plane material color based on microphone amplitude
                const amplitude = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
                planeMaterial.color.setRGB(amplitude, amplitude, amplitude);

                renderer.render(scene, camera);
            }

            updateCameraImage();
        };
    })
    .catch(function(err) {
        console.error('Error accessing camera: ', err);
    });
