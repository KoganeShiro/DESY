

const video = document.getElementById('camera-video');

        // Microphone class (assuming it's in a separate file)
        const mic = new Microphone(2048)

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        const planeGeometry = new THREE.PlaneGeometry(video.videoWidth, video.videoHeight);
        const material = new THREE.MeshBasicMaterial({ map: new THREE.Texture(video) });

        const plane = new THREE.Mesh(planeGeometry, material);
        scene.add(plane);

        camera.position.z = 3;

function animate() {
    requestAnimationFrame(animate);

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        material.map.needsUpdate = true; // Update texture with new video frame
    }
            // Access audio data from Microphone class (assuming getVolume returns a value between 0-1)
    const volume = mic.getVolume();

            // Implement your desired RGB split effect based on volume (example)
    const rgbOffset = volume * 0.5; // Adjust offset based on volume (0-0.5)
    plane.material.uniforms = {
        redOffset: { value: rgbOffset },
        greenOffset: { value: 0 },
        blueOffset: { value: -rgbOffset },
    };
            // Update shader uniforms (if using a custom shader)
    renderer.render(scene, camera);
}

animate();