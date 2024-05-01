//if the liquid effect doesn't work, search for a glitch effect

// Create a new Three.js scene
const scene = new THREE.Scene();

// Create a new camera
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
camera.position.z = 0.5;

// Create a plane geometry to represent the camera view
const planeGeometry = new THREE.PlaneBufferGeometry(1, 1, 32, 32); // Default dimensions with segments

// Define the liquid shader material with opacity uniform
const liquidShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    iTime: { value: 0 }, // Time uniform for animation
    iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }, // Resolution uniform
    brightness: { value: 0.975 }, // Brightness uniform
    amplitude: { value: 0 }, // Amplitude of the sound (optional)
    opacity: { value: 0.5 }, // Opacity uniform (0 - transparent, 1 - opaque)
    videoTexture: { value: null }, // Video texture uniform
  },
  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision mediump float;
    #define RADIANS 0.017453292519943295
    
    const int zoom = 40;
    uniform float iTime;
    uniform vec2 iResolution;
    uniform float brightness;
    uniform float amplitude;
    uniform float opacity;
    uniform sampler2D videoTexture;
    
    float cosRange(float degrees, float range, float minimum) {
      return (((1.0 + cos(degrees * RADIANS)) * 0.5) * range) + minimum;
    }

    void main() {
        float time = iTime * 1.25;
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        vec2 p = (2.0 * gl_FragCoord.xy - iResolution.xy) / max(iResolution.x, iResolution.y);
        float ct = cosRange(time * 5.0, 3.0, 1.1);
        float xBoost = cosRange(time * 0.2, 5.0, 5.0);
        float yBoost = cosRange(time * 0.1, 10.0, 5.0);
        
        float fScale = cosRange(time * 15.5, 1.25, 0.5);
        
        for (int i = 1; i < zoom; i++) {
            float _i = float(i);
            vec2 newp = p;
            newp.x += 0.25 / _i * sin(_i * p.y + time * cos(ct) * 0.5 / 20.0 + 0.005 * _i) * fScale + xBoost;
            newp.y += 0.25 / _i * sin(_i * p.x + time * ct * 0.3 / 40.0 + 0.03 * float(i + 15)) * fScale + yBoost;
            p = newp;
        }
        
        vec3 col = vec3(0.5 * sin(3.0 * p.x) + 0.5, 0.5 * sin(3.0 * p.y) + 0.5, sin(p.x + p.y));
        col *= brightness;
        
        // Add border
        float vigAmt = 5.0;
        float vignette = (1. - vigAmt * (uv.y - 0.5) * (uv.y - 0.5)) * (1. - vigAmt * (uv.x - 0.5) * (uv.x - 0.5));
        float extrusion = (col.x + col.y + col.z) / 4.0;
        extrusion *= 1.5;
        extrusion *= vignette;
        
        // Adjust extrusion based on amplitude
        extrusion *= amplitude;
        
        gl_FragColor = vec4(col, extrusion);
    }
  `
});


// Need to find a way to apply the effect on the camera
const cameraMesh = new THREE.Mesh(planeGeometry, liquidShaderMaterial);
cameraMesh.position.set(0, 0, -1); // Adjust position as needed
scene.add(cameraMesh);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Access the camera feed and apply it to the plane geometry as a texture
navigator.mediaDevices.getUserMedia({ video: true })
  .then(function (stream) {
    const video = document.createElement('video');
    video.autoplay = true;
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', function () {
      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBFormat;
      const aspectRatio = video.videoWidth / video.videoHeight;
      planeGeometry.scale(aspectRatio, 1, 1);

      liquidShaderMaterial.uniforms.videoTexture.value = texture;
      renderer.render(scene, camera);
    });
  })
  .catch(function (error) {
    console.error('Error accessing camera: ', error);
  });

// Function to update the shader uniforms based on time
function update(time) {
  liquidShaderMaterial.uniforms.iTime.value = time * 0.0005; // animation speed
  renderer.render(scene, camera);
  requestAnimationFrame(update);
}

update(0);

