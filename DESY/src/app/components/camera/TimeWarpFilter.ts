function TimeWarpFilter(renderer) {
    var self = this,

        tRenderer = renderer.tRenderer,
        scene = renderer.scene,
        camera = renderer.camera,
        mesh = renderer.mesh,

        width = renderer.width,
        height = renderer.height,

        renderTargetA,
        renderTargetB,
        renderTargets = [],
        rtCount = 50,

        uniforms,
        basicMaterial = new THREE.MeshBasicMaterial(),
        filterMaterial,
        noiseOffset = 0,

        verticalTexture = generateVertical(),
        horizontalTexture = generateHorizontal(),

        gradientTexture,

        initialized = false;

    self.name = "Time Warp";

    self.controls = {
        Frames: {
            type: 'slider',
            value: 50,
            min: 1,
            max: 200,
            step: 1,
            onChange: update
        },
        Shape: {
            type: 'slider',
            value: 0,
            min: 0,
            max: 3,
            step: 1,
            labels: [
                'Blocks',
                'Waves',
                'Vertical',
                'Horizontal',
            ],
            onChange: update
        },
        Size: {
            type: 'slider',
            value: 20,
            min: 1,
            max: 100,
            step: 1,
            onChange: update,
            disabled: false
        },
    }

    uniforms = {
        resolution: {
            type: "v2",
            value: new THREE.Vector2(100, 100)
        },
        total: {
            type: "f",
            value: 0
        },
        offset: {
            type: "f",
            value: 0
        },
        liveImageTexture: {
            type: 't',
            value: generateStatic()
        },
        overlayImageTexture: {
            type: 't'
        },
        inputImageTextures: {
            type: 'tv'
        }
    };

    filterMaterial = new THREE.ShaderMaterial({
        uniforms:		uniforms,
        vertexShader:   BasicVertexShader,
        fragmentShader: generateShader()
    });

    function update() {
        var newRtCount = self.controls.Frames.value,
            newRenderTargets = [];

        if (newRtCount > rtCount) {
            newRenderTargets = setupRenderTargets(newRtCount - rtCount);
            renderTargets = renderTargets.concat(newRenderTargets);
        }
        else if (newRtCount < rtCount) {
            renderTargets.splice(newRtCount);
        }

        rtCount = newRtCount;

        if (self.controls.Shape.value > 1 && !self.controls.Size.disabled) {
            self.controls.Size.disabled = true;
            interface.updateSlider(self.controls.Size); // This is not the best
        }
        else if (self.controls.Shape.value <= 1 && self.controls.Size.disabled) {
            self.controls.Size.disabled = false;
            interface.updateSlider(self.controls.Size); // This is not the best
        }

        switch (self.controls.Shape.value) {
            case 0:
                gradientTexture = generateStatic();
                break
            case 1:
                gradientTexture = generatePerlin();
                break;
            case 2:
                gradientTexture = verticalTexture;
                break;
            case 3:
                gradientTexture = horizontalTexture;
                break;
        }
    }
    update();

    function generatePerlin() {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            texture = new THREE.Texture(canvas),
            width = 128, height = 128,
            x, y, o, c, imageData, data, image,
            size = self.controls.Size.value;

        //noiseOffset += .01;
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

                o = noise.perlin3(x/size, y/size, noiseOffset/20);
                c = Math.floor(o * 128)+128;
                data[ i   ] = c;
                data[ i +1] = c;
                data[ i +2] = c;
            }
        }

        context.putImageData(imageData, 0, 0);

        //texture.minFilter = THREE.NearestFilter;
        //texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        return texture;
    }

    function generateStatic() {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            texture = new THREE.Texture(canvas),
            width = 128, height = 128,
            x, y, r, imageData, data, image,
            size = self.controls.Size.value;

        canvas.width = width;
        canvas.height = height;

        context.fillRect( 0, 0, width, height );

        for (y = 0; y < height; y += size) {
            for (x = 0; x < width; x += size) {
                r = Math.floor(Math.random() * 256);

                context.fillStyle = 'rgb('+r+','+r+','+r+')';

                context.fillRect(x, y, size, size);
            }
        }

        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        return texture;
    }

    function generateVertical() {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            texture = new THREE.Texture(canvas),
            width = 128, height = 128,
            gradient;

        canvas.width = width;
        canvas.height = height;

        gradient = context.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#000');
        gradient.addColorStop(1, '#fff');
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);

        texture.needsUpdate = true;
        return texture;
    }

    function generateHorizontal() {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            texture = new THREE.Texture(canvas),
            width = 128, height = 128,
            gradient;

        canvas.width = width;
        canvas.height = height;

        gradient = context.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#000');
        gradient.addColorStop(1, '#fff');
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);

        //texture.minFilter = THREE.NearestFilter;
        //texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        return texture;
    }

    function generateShader() {
        var i,
            shader = [
                'varying vec2 textureCoordinate;',
                'uniform vec2 resolution;',
                'uniform float total;',
                'uniform float offset;',
                'uniform sampler2D overlayImageTexture;',
                'uniform sampler2D liveImageTexture;',
                'uniform sampler2D inputImageTextures[10];'
            ];


        shader.push('void main() {');
        shader.push('vec4 color = texture2D(liveImageTexture, textureCoordinate);');
        shader.push('float limit = total + offset;');
        shader.push('float y = floor(color.r * total) + offset;');

        shader.push('if (y > 9.0) {y = 9.0;}'); // GLSL hurts my head

        for (i = 0; i < 10; i ++) {
            if (!i) {
                shader.push('if (y == 0.0) {');
            }
            else {
                shader.push('else if (y == ' + i + '.0) {');
            }

            shader.push('color = texture2D(inputImageTextures[' + i + '], textureCoordinate);\n}');
        }

        shader.push('else {color = texture2D(overlayImageTexture, textureCoordinate);}');

        //shader.push('if (total > 10.0 && y >= limit) {color = texture2D(overlayImageTexture, textureCoordinate);}');

        shader.push('gl_FragColor = color;\n}');

        return shader.join('\n');
    }

    function setupRenderTargets(count) {
        var newRenderTargets = [];

        for (i = 0; i < count; i++) {
            newRenderTargets.push(new THREE.WebGLRenderTarget(width, height, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter}));
        }

        for (i = 0; i < count; i ++) {
            tRenderer.render(scene, camera, newRenderTargets[i]);
        }

        return newRenderTargets;
    }

    function initialize() {
        renderTargetA = new THREE.WebGLRenderTarget(width, height, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});
        renderTargetB = new THREE.WebGLRenderTarget(width, height, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});

        tRenderer.render(scene, camera, renderTargetA);
        tRenderer.render(scene, camera, renderTargetB);

        renderTargets = setupRenderTargets(rtCount);

        initialized = true;
    }

    self.render = function (rInput, rOutput) {
        var i, ii, remainder, flip = 0, last;

        noiseOffset += .1;
        uniforms.liveImageTexture.value = gradientTexture;

        basicMaterial.map = rInput;
        mesh.material = basicMaterial;

        if (!initialized) { initialize(); }

        last = renderTargets.pop();
        renderTargets.unshift(last);

        tRenderer.render(scene, camera, renderTargets[0]);
        if (rtCount <= 10) {
            tRenderer.render(scene, camera, renderTargetB);
        }

        mesh.material = filterMaterial;

        for (i = 0; i < rtCount; i += 10) {
            if (flip) {
                input = renderTargetA.texture;
                output = renderTargetB;
            }
            else {
                input = renderTargetB.texture;
                output = renderTargetA;
            }

            //uniforms.liveImageTexture.value = renderTargets[0];
            uniforms.overlayImageTexture.value = input;

            remainder = rtCount - i;

            if (remainder >= 10) {
                uniforms.inputImageTextures.value = renderTargets.slice(i, i+10).map(function (rt) {return rt.texture});
            }
            else {
                uniforms.inputImageTextures.value = renderTargets.slice(i, i+remainder).map(function (rt) {return rt.texture});

                for (ii = 0; ii < 10-remainder; ii ++) {
                    uniforms.inputImageTextures.value.push(input);
                }
            }

            uniforms.offset.value = -i;
            uniforms.total.value = rtCount;

            tRenderer.render(scene, camera, output);

            flip = !flip;
        }

        tRenderer.render(scene, camera, rOutput);
    };
}
