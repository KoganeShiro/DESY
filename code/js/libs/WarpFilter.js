function WarpFilter() {
    var self = this,
        noiseOffset = 0;

    self.name = "Warp";

    self.controls = {
        Strength: {
            type: 'slider',
            uniform: 'multiplier',
            value: .3,
            min: 0,
            max: 2
        },
        Size: {
            type: 'slider',
            value: 30,
            min: 2,
            max: 100 
        },
        Speed: {
            type: 'slider',
            value: .01,
            min: .001,
            max: .5,
            step: .001
        }
    };

    self.uniforms = {
        multiplier: {
            type: "f",
            value: .3,
        },
        inputImageTexture: {
            type: 't'
        },
        inputImageTexture2: {
            type: 't',
            value: generate()
        },
    };

    function generate() {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            texture = new THREE.Texture(canvas),
            width = 128, height = 128,
            x, y, o, c, imageData, data, image,
            size = self.controls.Size.value;

        noiseOffset += self.controls.Speed.value;
        //noise.seed(Math.random());

        canvas.width = width;
        canvas.height = height;
        context.fillRect( 0, 0, width, height );

        imageData = context.getImageData( 0, 0, width, height );
        data = imageData.data;
        
        for (y = 0; y < height; y ++) {
            for (x = 0; x < width; x ++) {
                i = ((y * width) + x) * 4;
                ii = ((y * width) + x) * 3;

                o = noise.perlin3(x/size, y/size, noiseOffset);
                c = Math.floor(o * 128)+128;
                data[ i   ] = c;

                o = noise.perlin3(x/size, y/size, noiseOffset+4330);
                c = Math.floor(o * 128)+128;
                data[ i +1] = c;

                data[ i +2] = 0;
            }
        }

        context.putImageData(imageData, 0, 0);

        //texture.minFilter = THREE.NearestFilter;
        //texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        return texture;
    }

    setInterval(function () {self.uniforms.inputImageTexture2.value = generate();}, 1000/60);

    self.material = new THREE.ShaderMaterial({
        uniforms:		self.uniforms,
        vertexShader:   BasicVertexShader,
        fragmentShader: WarpShader 
    });
}
