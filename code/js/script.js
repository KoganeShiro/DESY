
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';

// Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
const stats = new Stats();
document.body.appendChild(stats.domElement);

// Load Image
const textureLoader = new THREE.TextureLoader();
const imageTexture = textureLoader.load('path/to/your/image.jpg');

// Plane Geometry
const planeGeometry = new THREE.PlaneGeometry(5, 5, 256, 256); // Adjust size and segments as needed

// Custom Shader Material
const liquidShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        fftData: { value: new Float32Array(256) }, // FFT data uniform
        imageTexture: { value: imageTexture },
        time: { value: 0.0 }
    },
    vertexShader: `
        uniform float time;
        uniform sampler2D fftTexture; // Assuming you store FFT data in a texture

        // Additional uniforms for vertex movement control (adjust as needed)
        uniform float movementScale;
        uniform float frequencyCutoff; // Optional: filter out low frequencies

        varying vec2 vUv;

        void main() {
            // Sample FFT data from texture
            float frequencySample = texture2D(fftTexture, gl_Position.xy / vec2(textureSize(fftTexture).x, 1.0)).r;

            // Apply a movement based on frequency and time (optional)
            if (frequencySample > frequencyCutoff) { // Optional: filter out low frequencies
            vec2 movement = vec2(sin(time + frequencySample * movementScale), 0.0);
            gl_Position += vec4(movement, 0.0, 1.0);
            }

            vUv = uv;
        }
        `,

    fragmentShader: `
        precision mediump float;
        uniform sampler2D imageTexture;
        uniform sampler2D fftTexture; // Assuming you store FFT data in a texture
        uniform float time;
        varying vec2 vUv;

        // Additional uniforms for liquid effect control (adjust as needed)
        uniform float frequencyScale;
        uniform float amplitudeScale;

        // Utility functions (replace with your own if needed)
        float mapRange(float value, float inMin, float inMax, float outMin, float outMax) {
            return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
        }

        void main() {
            vec3 color = texture2D(imageTexture, vUv).rgb;

            // Sample FFT data from texture
            float frequencySample = texture2D(fftTexture, gl_FragCoord.xy / vec2(textureSize(fftTexture).x, 1.0)).r;

            // Calculate displacement based on FFT data and time
            float displacement = sin(vUv.x * frequencyScale * time + frequencySample * amplitudeScale);

            // Apply displacement to UV coordinates for texture sampling
            vec2 displacedUV = vUv + vec2(displacement, 0.0);

            // Sample the image texture with displaced UV coordinates
            vec3 distortedColor = texture2D(imageTexture, displacedUV).rgb;

            // Apply additional effects or blending (optional)

            gl_FragColor = vec4(distortedColor, 1.0);
        }
        `,

});

const plane = new THREE.Mesh(planeGeometry, liquidShaderMaterial);
scene.add(plane);

// Resize handler
window.addEventListener('resize', onWindowResize);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

let context;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    updateFFTData(); // Update FFT data here
    render();
    stats.update();
}

function render() {
    renderer.render(scene, camera);
}

function updateFFTData() {
    if (!context) {
      // Create audio context and analyzer if not already created
      context = new AudioContext();
      analyser = context.createAnalyser();
      analyser.fftSize = 256; // Adjust based on desired frequency resolution
  
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then(function (stream) {
          const mediaSource = context.createMediaStreamSource(stream);
          mediaSource.connect(analyser);
        })
        .catch(function (err) {
          alert(err);
        });
    }
  
    if (context) {
      // Get byte frequency data from the analyzer
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(frequencyData);
  
      // Convert byte data to frequency magnitudes (adjust scaling as needed)
      const fftData = new Float32Array(frequencyData.length);
      for (let i = 0; i < frequencyData.length; i++) {
        fftData[i] = frequencyData[i] / 255.0; // Normalize between 0.0 and 1.0
      }
  
      // Update the fftData uniform in the liquidShaderMaterial
      liquidShaderMaterial.uniforms.fftData.value = fftData;
    }
  }  

animate();
