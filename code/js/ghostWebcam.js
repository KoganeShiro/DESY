
var videoTexture, videoSettings, rawVideoStream, videoStream, audioTrack;
let gui = new dat.GUI({ autoPlace: false });

// Initialize Microphone
const microphone = new Microphone(1024);

var renderer, scene, camera, smoother;

function init() {
	let w = videoSettings.width;
	let h = videoSettings.height;

	//Renderer setup
	document.body.style = "overflow: hidden;";
	var container = document.createElement("div");

	document.body.appendChild(container);
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(w, h);
	container.appendChild(renderer.domElement);

	container.style.transform = 'translateX(-50%) translateY(-50%)';
	container.style.position = 'absolute';
	container.style.top = '50%';
	container.style.left = '50%';
	
	/* Smoothen the video lead to us to this ghost effect */
	smoother = new Smoother(videoTexture, undefined, undefined, renderer);
	//gui.add(smoother, "remember", 0.01, 1, 0.01);
	//gui.add(smoother, "refresh", 0, 0.99, 0.01);
	gui.add({smoothing:0.95},"smoothing",0.8,0.99,0.01).onChange(function(v) {
		smoother.remember = v;
		smoother.refresh = 1-v;
	});
	//Scene setup:
	/*scene = new THREE.Scene();
	
	let display = new THREE.Mesh(
		new THREE.PlaneBufferGeometry(2, 2),
		new THREE.MeshBasicMaterial({map: videoTexture})
	);
	scene.add(display);
	
	//Camera setup:
	camera = new THREE.OrthographicCamera(-1,1,1,-1);
	camera.position.z = 1;
	//scene.add(camera);
	*/
	

	/* Change it to an actual button + add screenshot */
	videoStream = renderer.domElement.captureStream(videoSettings.frameRate);
	videoStream.addTrack(audioTrack);
	
	let data, mediaRecorder;
	let recording = false;
	gui.add({record: function() {
		if (!recording) {
			data = [];
			mediaRecorder = new MediaRecorder(videoStream);

			console.log(mediaRecorder.mimeType);

			mediaRecorder.ondataavailable = function(e) {data.push(e.data);};
			mediaRecorder.onstop = function(e) {
				//let blob = new Blob(data, {type: "video/webm"});
				let blob = new Blob(data, {type: mediaRecorder.mimeType});
				let a = document.createElement("a");
				a.download = "Video_recording";//true;//"Video_recording.webm";
				a.href = window.URL.createObjectURL(blob);
				a.click();
			}
			mediaRecorder.start();
			recording = true;
		} else {
			mediaRecorder.stop();
			recording = false;
		}
	}},"record");

	const navbarHeight = document.querySelector('nav').offsetHeight;
	const guiContainer = document.createElement('div');
	guiContainer.appendChild(gui.domElement);
	document.body.appendChild(guiContainer);
	guiContainer.style.position = 'fixed';
	guiContainer.style.top = `${navbarHeight}px`;
	guiContainer.style.right = '0px';
	guiContainer.style.width = '100%';
	guiContainer.style.height = '30%'; 

	setInterval(function() {
			smoother.update()
			//renderer.render(scene, camera);
		}, 1000./videoSettings.frameRate);
}