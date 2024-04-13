
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.117.1/build/three.module.js";


var videoTexture, videoSettings, rawVideoStream, videoStream, audioTrack;
let gui = new dat.GUI();

// Initialize Microphone
const fftSize = 512;
const microphone = new Microphone(fftSize);

var renderer, scene, camera, smoother;

function init() {
	let w = videoSettings.width;
	let h = videoSettings.height;

	//Renderer setup
	document.body.style = "overflow: hidden;";
	var container = document.createElement("div");
	document.body.appendChild(container);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(w, h);
	container.appendChild(renderer.domElement);

	container.style.transform = 'translateX(-50%) translateY(-50%)';
	container.style.position = 'absolute';
	container.style.top = '50%';
	container.style.left = '50%';

	camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
				camera.position.z = 5;
				
	const geometry = new THREE.PlaneGeometry(11, 8);
	const material = new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide });
	const mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);

	// Render the scene
	function animate() {
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
	}

	composer = new THREE.EffectComposer(renderer);
	const renderPass = new THREE.RenderPass(scene, camera);
	composer.addPass(renderPass);

	const myEffect = {
		uniforms: {
			"tDiffuse": { value: null },
			"resolution": { value: new THREE.Vector2(1., window.innerHeight / window.innerWidth) },
			"uMouse": { value: new THREE.Vector2(-10, -10) },
			"uVelo": { value: 0 },
		},
		vertexShader: `varying vec2 vUv;void main() {vUv = uv;gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );}`,
		fragmentShader: `uniform float time;
		uniform sampler2D tDiffuse;
		uniform vec2 resolution;
		varying vec2 vUv;
		uniform vec2 uMouse;
		float circle(vec2 uv, vec2 disc_center, float disc_radius, float border_size) {
			uv -= disc_center;
			uv *= resolution;
			float dist = sqrt(dot(uv, uv));
			return smoothstep(disc_radius + border_size, disc_radius - border_size, dist);
		}
		void main()  {
			vec2 newUV = vUv;
			float c = circle(vUv, uMouse, 0.0, 0.2);
			float r = texture2D(tDiffuse, newUV.xy += c * (0.1 * .5)).x;
			float g = texture2D(tDiffuse, newUV.xy += c * (0.1 * .525)).y;
			float b = texture2D(tDiffuse, newUV.xy += c * (0.1 * .55)).z;
			vec4 color = vec4(r, g, b, 1.0);
			gl_FragColor = color;
		}`
	}

	customPass = new THREE.ShaderPass(myEffect);
	customPass.renderToScreen = true;
	composer.addPass(customPass);

	// Mouse move event listener
	document.addEventListener('mousemove', (e) => {
		// mousemove / touchmove
		uMouse.x = (e.clientX / window.innerWidth);
		uMouse.y = 1. - (e.clientY / window.innerHeight);
	});

	animate();
}

init();
