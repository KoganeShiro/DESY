// Create a new video element
const video = document.createElement('video');
video.autoplay = true;
video.muted = true;
video.style.display = 'none';
document.body.appendChild(video);

// Create a new Three.js scene
const scene = new THREE.Scene();

// Define the liquid vertex shader
const liquidVertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Define the liquid fragment shader
const liquidFragmentShader = `
uniform sampler2D texture;
uniform float time;
varying vec2 vUv;

void main() {
    // Adjust these parameters to control the liquid effect
    float speed = 2.0; // Speed of the liquid waves
    float frequency = 1.5; // Frequency of the liquid waves

    // Calculate the displacement of the current pixel
    float displacement = sin(vUv.y * frequency + time * speed) * 0.1;

    // Apply the displacement to the current pixel position
    vec2 displacedUV = vUv + vec2(0.0, displacement);

    // Sample the texture at the displaced UV coordinates
    vec4 color = texture2D(texture, displacedUV);

    gl_FragColor = color;
}
`;

// Define the liquid material
const liquidMaterial = new THREE.ShaderMaterial({
    uniforms: {
        texture: { value: null }, // Texture uniform for the liquid surface
        time: { value: 0 }, // Time uniform for animation
    },
    vertexShader: liquidVertexShader,
    fragmentShader: liquidFragmentShader,
});

// Create a plane geometry to represent the liquid surface
const planeGeometry = new THREE.PlaneBufferGeometry(2, 2); // Adjust the size as needed

// Create a mesh using the liquid material and geometry
const liquidMesh = new THREE.Mesh(planeGeometry, liquidMaterial);

// Add the liquid mesh to the scene
scene.add(liquidMesh);

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

            // Apply the video texture to the liquid material
            liquidMaterial.uniforms.texture.value = texture;

            const microphoneSource = audioContext.createMediaStreamSource(stream);
            microphoneSource.connect(analyser);
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            // Modify liquid animation based on microphone input
            function updateLiquidAnimation() {
                requestAnimationFrame(updateLiquidAnimation);

                analyser.getByteFrequencyData(dataArray);

                // Calculate amplitude
                const amplitude = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;

                // Update time uniform in the liquid material based on amplitude
                liquidMaterial.uniforms.time.value += amplitude * 0.001; // Adjust the multiplier for animation speed

                // Render the scene
                renderer.render(scene, camera);
            }

            updateLiquidAnimation();
        };
    })
    .catch(function(err) {
        console.error('Error accessing camera: ', err);
    });

// Create a new camera
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
camera.position.z = 0.5;

// Create a new renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Style the renderer canvas for centering
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0'; // Position at top
renderer.domElement.style.left = '0'; // Position at left
