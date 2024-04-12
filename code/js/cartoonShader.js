var videoTexture, videoSettings, cartoonStream, audioTrack;
var clock, renderer, scene, camera, cartoonScene, cartoonCamera, cartoonTarget, smoother, display;
var data, mediaRecorder, fpsIn, fpsOut=300;

navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(function(stream) {
	videoSettings = stream.getVideoTracks()[0].getSettings();
	audioTrack = stream.getAudioTracks()[0];
	let videoStream = new MediaStream(stream.getVideoTracks());
	let video = document.createElement("video");
	Object.assign(video, {
		srcObject: videoStream,//stream,
		//height: videoSettings.height,
		//width: videoSettings.width,
		autoplay: true,
	});
	//document.body.appendChild(video);
	videoTexture = new THREE.VideoTexture(video);
	videoTexture.minFilter = THREE.LinearFilter;
	init();
	}
	).catch(function(error){console.error(error);});

function init() {
	let w = videoSettings.width;
	let h = videoSettings.height;
	let fpsIn = videoSettings.framerate;
	
	//Renderer setup
	clock = new THREE.Clock(/*false*/); //false vil skru av autostart
	document.body.style = "overflow: hidden;";
	var container = document.createElement("div");
	container.style = "text-align: center; width: 100vw"
	document.body.appendChild(container);
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(w, h);
	container.appendChild(renderer.domElement);
	
	//Scene setup:
	cartoonScene = new THREE.Scene();
	var cartoonMat = new THREE.ShaderMaterial({
		uniforms: {
			map: {value:videoTexture},
			resolution: {value:new THREE.Vector2(w,h)},
			mul: new THREE.Uniform(3.2),
			bias: new THREE.Uniform(-4.5),
			evening: new THREE.Uniform(0.25),
		},
		vertexShader: THREE.ShaderLib.basic.vertexShader,
		fragmentShader: document.getElementById("cartoonShader").textContent
	});
	
	let gui = new dat.GUI();
	gui.add(cartoonMat.uniforms.mul,"value",0,20).name("Edge sensitivity");
	gui.add(cartoonMat.uniforms.bias,"value",-10,10).name("Edge bias");
	gui.add(cartoonMat.uniforms.evening,"value",0,1).name("Color evening");
	
	var cartoonDisplay = new THREE.Mesh(
		new THREE.PlaneBufferGeometry(w, h),
		cartoonMat//new THREE.MeshBasicMaterial({map: videoTexture})
	);
	cartoonScene.add(cartoonDisplay);
	
	//Camera setup:
	cartoonCamera = new THREE.OrthographicCamera(-0.5*w, 0.5*w, 0.5*h, -0.5*h, 1,10);
	cartoonCamera.position.z = 5;
	
	cartoonTarget = new THREE.WebGLRenderTarget(w,h);
	smoother = new Smoother(cartoonTarget, 0.65,0.35,renderer);
	
	gui.add(smoother,"remember",0,0.99);
	gui.add(smoother,"refresh",0.01,1);
	
	scene = new THREE.Scene();
	display = new THREE.Mesh(
		new THREE.PlaneBufferGeometry(2,2),
		new THREE.MeshBasicMaterial({map: smoother.getTex()})
	);
	scene.add(display);
	camera = new THREE.OrthographicCamera();
	camera.position.z = 2;
	
	//cartoonStream = renderer.domElement.captureStream(0);
	cartoonStream = renderer.domElement.captureStream(fpsIn);
	cartoonStream.addTrack(audioTrack);
	console.log(cartoonStream.getVideoTracks()[0].getSettings());
	
	let recording = false;
	gui.add({record: function() {
		if (!recording) {
			data = [];
			mediaRecorder = new MediaRecorder(cartoonStream);
			let logOnce = true;
			mediaRecorder.ondataavailable = function(e) {
				if (logOnce) {
					logOnce = false;
					console.log(e);
				}
				data.push(e.data);
			};
			mediaRecorder.onstop = function(e) {
				let blob = new Blob(data, {type: mediaRecorder.mimeType});
				blob.lastModifiedDate = new Date();
				let a = document.createElement("a");
				a.download = "Cartoon_recording";
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
	
	animate();
	//setInterval(animate, 1000./fpsIn);
}

function animate() {
	setInterval(function() {
		renderer.setRenderTarget(cartoonTarget);
		renderer.render(cartoonScene, cartoonCamera);
		renderer.setRenderTarget(null);
		smoother.update()
		//renderer.render(scene, camera);
	}, 1000./fpsIn);

	/*renderer.setRenderTarget(cartoonTarget);
	renderer.render(cartoonScene, cartoonCamera);
	renderer.setRenderTarget(null);
	smoother.update();
	//display.material.map = smoother.getTex();
	renderer.render(scene, camera);
	
	if (mediaRecorder && mediaRecorder.state==='paused') {
		console.log("Resuming.");
		mediaRecorder.resume();
	}
	//cartoonStream.getVideoTracks()[0].requestFrame(); //Test
	setTimeout(function() {
		if (mediaRecorder && mediaRecorder.state!=='inactive') {
			console.log("Requesting data and pausing...");
			mediaRecorder.requestData();
			mediaRecorder.pause();
		}
		setTimeout(animate, 1000./fpsIn); //Would use requestAnimationFrame for CGI
	}, 1000./fpsOut);*/
}