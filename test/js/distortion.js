
function Distord(source, remember, refresh, renderer) {
	this.source = source;
	this.remember = typeof remember !== "undefined" ? remember : 0.5;
	this.refresh = typeof refresh !== "undefined" ? refresh : 1-this.remember;
	this.renderer = renderer;
	this.ready = false;

	if (!(this.source.image instanceof HTMLVideoElement)) this.init();
	else {
		console.log("Source is video texture.");
		let scope = this;
		this.source.image.addEventListener("playing", function() {scope.init.call(scope);});
	}
}
Distord.prototype = Object.create(Object.prototype);
Object.assign(Distord.prototype, {
	constructor: Distord,
	init: function() {
		let w = this.source.width || this.source.image.videoWidth;
		let h = this.source.height || this.source.image.videoHeight;

		console.log("Distord: w=%d, h=%d", w,h);

		this.targets = [new THREE.WebGLRenderTarget(w, h),
		new THREE.WebGLRenderTarget(w, h)];
		this.flipflop = 0;
		this.camera = new THREE.OrthographicCamera();
		this.camera.position.z = 2;
		this.scene = new THREE.Scene();
		let geom = new THREE.PlaneBufferGeometry(2,2);
		this.mat = new THREE.ShaderMaterial({
			uniforms: {
                "tDiffuse": {
                    value: null
                },
                "resolution": {
                    value: new THREE.Vector2(1., window.innerHeight / window.innerWidth)
                },
                "uMouse": {
                    value: new THREE.Vector2(-10, -10)
                },
                "uVelo": {
                    value: 0
                }
            },
            vertexShader: "varying vec2 vUv;void main() {vUv = uv;gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );}",
            fragmentShader: "uniform float time;\n        uniform sampler2D tDiffuse;\n        uniform vec2 resolution;\n        varying vec2 vUv;\n        uniform vec2 uMouse;\n        float circle(vec2 uv, vec2 disc_center, float disc_radius, float border_size) {\n          uv -= disc_center;\n          uv*=resolution;\n          float dist = sqrt(dot(uv, uv));\n          return smoothstep(disc_radius+border_size, disc_radius-border_size, dist);\n        }\n        void main()  {\n            vec2 newUV = vUv;\n            float c = circle(vUv, uMouse, 0.0, 0.2);\n            float r = texture2D(tDiffuse, newUV.xy += c * (0.1 * .5)).x;\n            float g = texture2D(tDiffuse, newUV.xy += c * (0.1 * .525)).y;\n            float b = texture2D(tDiffuse, newUV.xy += c * (0.1 * .55)).z;\n            vec4 color = vec4(r, g, b, 1.);\n\n            gl_FragColor = color;\n        }"
        });

		let display = new THREE.Mesh(geom,this.mat);
		this.scene.add(display);
		this.ready = true;
	},
	update: function() {
		if (!this.ready) return;
		this.mat.uniforms.remember.value = this.remember;
		this.mat.uniforms.refresh.value = this.refresh;

		this.renderer.setRenderTarget(this.targets[this.flipflop]);
		this.renderer.render(this.scene,this.camera);
		this.renderer.setRenderTarget(null);
		this.renderer.render(this.scene,this.camera); //DEBUG
		this.mat.uniforms.state.value = this.targets[this.flipflop].texture;
		this.flipflop = 1-this.flipflop;
	},
	getTex: function() {
		return this.targets[1-this.flipflop].texture;
	}
});
