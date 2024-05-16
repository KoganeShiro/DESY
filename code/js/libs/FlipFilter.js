function FlipFilter() {
    var self = this;

    self.name = "Flip";

    self.uniforms = {
        inputImageTexture: {
            type: 't'
        },
    };

    self.controls = {}

    self.material = new THREE.ShaderMaterial({
        uniforms:		self.uniforms,
        vertexShader:   BasicVertexShader,
        fragmentShader: FlipShader 
    });
}
