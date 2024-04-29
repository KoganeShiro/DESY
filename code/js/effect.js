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
navigator.mediaDevices.getUserMedia({ video: true, audio: true }) // Request both video and audio tracks
  .then(function (stream) {
    video.srcObject = stream;

    // Apply the video texture once the video metadata is loaded
    video.onloadedmetadata = function () {
      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBFormat;

      // Adjust the plane geometry to match the video dimensions
      const aspectRatio = video.videoWidth / video.videoHeight;
      planeGeometry.scale(aspectRatio, 1, 1);

      // Apply the video texture to the plane material
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
    
        // Calculate amplitude
        const amplitude = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
    
        let color;
        if (amplitude === 0) {
            // No sound, go back to normal color
            color = new THREE.Color(1, 1, 1); // White
        } else {
            // Calculate color based on amplitude
            const hue = mapRange(amplitude, 0, 255, 240, 0); // Map amplitude to hue value
            color = new THREE.Color().setHSL(hue / 360, 1, 0.5); // Convert hue to RGB
        }
    
        // Set color for all vertices
        const colors = [];
        for (let i = 0; i < planeGeometry.attributes.position.count; i++) {
            colors.push(color.r, color.g, color.b);
        }
        planeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
        // Render the scene
        renderer.render(scene, camera);
    }

      /*
      function updateCameraImage() {
        requestAnimationFrame(updateCameraImage);

        analyser.getByteFrequencyData(dataArray);

        // Calculate amplitude
        const amplitude = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;

        // Update warmPoint with a new random position
        warmPoint.x = Math.random();
        warmPoint.y = Math.random();

        // Iterate over all pixels and update their color based on position, warmPoint, and amplitude
        for (let i = 0; i < planeGeometry.attributes.position.count; i++) {
          const position = {
            x: planeGeometry.attributes.position.getX(i),
            y: planeGeometry.attributes.position.getY(i)
          };
          const distance = getDistance(position, warmPoint);
          const maxDistance = Math.sqrt(2); // Assuming planeGeometry covers a unit square (adjust if needed)

          // Color intensity based on distance to warmPoint (higher closer to point)
          const colorIntensity = 1 - Math.min(distance / maxDistance, 1);

          // Amplitude modifier increases intensity with higher sound levels
          const amplitudeModifier = mapRange(amplitude, 0, 255, 0.5, 1.5);

          // Final intensity combines distance and amplitude effects
          const finalIntensity = colorIntensity * amplitudeModifier;

          // Adjust original color saturation or brightness based on finalIntensity
          const originalColor = new THREE.Color(planeMaterial.color.r, planeMaterial.color.g, planeMaterial.color.b);
          const adjustedColor = originalColor.clone();
          adjustedColor.setSatuanation(adjustedColor.getSaturation() * finalIntensity);
          // OR: adjustedColor.setBrightness(adjustedColor.getBrightness() + finalIntensity);

          planeGeometry.attributes.color.setXYZ(i, adjustedColor.r, adjustedColor.g, adjustedColor.b);
        }

        // Mark the colors as needing update
        planeGeometry.attributes.color.needsUpdate = true;

        // Render the scene
        renderer.render(scene, camera);
      }
      */
      function getDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
      }

      function mapRange(value, min1, max1, min2, max2) {
        return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
      }

      updateCameraImage();
    };
  })
  .catch(function (err) {
    console.error('Error accessing camera: ', err);
  });

// Create a new camera
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
camera.position.z = 0.5;

// Create a plane geometry to represent the camera view
const planeGeometry = new THREE.PlaneBufferGeometry(1, 1, 32, 32); // Default dimensions with segments
planeGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(planeGeometry.attributes.position.count * 3), 3));

// Create the mesh with planeGeometry and planeMaterial
const cameraMesh = new THREE.Mesh(planeGeometry, planeMaterial);
cameraMesh.position.set(0, 0, -1);
scene.add(cameraMesh);

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