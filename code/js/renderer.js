
function Renderer() {
    var self = this,

        inputTexture,
        inputWidth = 800,
        inputHeight = 600,
        needsUpdating = false,

        container = document.getElementById('container'),

        renderTargetA,
        renderTargetB,

        basicMaterial = new THREE.MeshBasicMaterial({transparent: true}),

        flipFilter = new FlipFilter(),
        flip = false;

    self.input = null;

    self.width = 800;
    self.height = 600;

    self.tRenderer = new THREE.WebGLRenderer({alpha: true, preserveDrawingBuffer: true});
    self.tRenderer.setClearColor(new THREE.Color(0xffffff));
    container.appendChild(self.tRenderer.domElement);

    self.camera = new THREE.OrthographicCamera(self.width / - 2, self.width / 2, self.height / 2, self.height / - 2, 1, 1000);
    self.camera.position.z = 300;
    
    self.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1));
    self.mesh.scale.x = self.width;
    self.mesh.scale.y = self.height;

    self.scene = new THREE.Scene();
    self.scene.add(self.mesh);

    self.filters = [];

    self.fullSizeVideo = false;
    
    renderTargetA = new THREE.WebGLRenderTarget(self.width, self.height, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});
    renderTargetB = new THREE.WebGLRenderTarget(self.width, self.height, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});

    self.resize = function () {
        var inner = document.getElementById('main'),
            pageWidth = inner.offsetWidth - 300 - 10 - 40,
            pageHeight = inner.offsetHeight - 40;

        self.width = inputWidth;
        self.height = inputHeight;

        if (!self.fullSizeVideo) {
            if (self.height > pageHeight) {
                self.width = pageHeight * (inputWidth/inputHeight);
                self.height = pageHeight;
            }
            if (self.width > pageWidth) {
                self.width = pageWidth;
                self.height = pageWidth * (inputHeight/inputWidth);
            }

            self.width = Math.round(self.width);
            self.height = Math.round(self.height);

            if (self.height > pageHeight) {
                self.width = pageHeight * (inputWidth/inputHeight);
                self.height = pageHeight;
            }
            if (self.width > pageWidth) {
                self.width = pageWidth;
                self.height = pageWidth * (inputHeight/inputWidth);
            }
        }

        self.width = Math.round(self.width);
        self.height = Math.round(self.height);

        self.tRenderer.setSize(self.width, self.height);

        self.camera.left = self.width / - 2;
        self.camera.right = self.width / 2;
        self.camera.top = self.height / 2;
        self.camera.bottom = self.height / - 2;
        self.camera.updateProjectionMatrix();

        renderTargetA = new THREE.WebGLRenderTarget(self.width, self.height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});
        renderTargetB = new THREE.WebGLRenderTarget(self.width, self.height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});

        self.mesh.scale.x = self.width;
        self.mesh.scale.y = self.height;

        function resizeFilter(filter) {
            if (filter.filters) {
                filter.filters.forEach(resizeFilter);
            }

            if (filter.uniforms && filter.uniforms.resolution) {
                filter.uniforms.resolution.value = new THREE.Vector2(self.width, self.height);
            }

            if (filter.resize) {
                filter.resize();
            }
        }
        self.filters.forEach(resizeFilter);
    };
    window.addEventListener('resize', self.resize);

    self.useInput = function (input, needsFlip) {
        if (input.tagName == 'VIDEO') {
            if (input.readyState != input.HAVE_ENOUGH_DATA) {
                setTimeout(function () {self.useInput(input, needsFlip);}, 0);
                return;
            }

            needsUpdating = true;
        }
        else {
            needsUpdating = false;
        }

        if (self.input && self.input.tagName == 'VIDEO') {
            self.input.pause();
            self.input.src = '';
            self.input.load();
        }

        self.input = input;

        flip = needsFlip;

        inputTexture = new THREE.Texture(input);
        inputTexture.minFilter = THREE.LinearFilter;
        inputTexture.magFilter = THREE.LinearFilter;
        inputTexture.needsUpdate = true;

        inputWidth = input.videoWidth || input.naturalWidth || input.width;
        inputHeight = input.videoHeight || input.naturalHeight || input.height;

        self.resize();
    };

    self.render = function render() {
        var index = 0,
            filters,
            lastFilterIndex,
            lastFilter;

        if (flip) {
            filters = [flipFilter].concat(self.filters);
        }
        else {
            filters = self.filters;
        }

        lastFilterIndex = filters.length;

        if (!inputTexture) { return; }

        if (needsUpdating) inputTexture.needsUpdate = true;

        do {
            lastFilterIndex --;
            lastFilter = filters[lastFilterIndex];
        }
        while (lastFilter.hidden && lastFilterIndex > 0);

        if (!lastFilter.hidden && lastFilter.filters) {
            lastFilter = lastFilter.filters[lastFilter.filters.length-1];
        }

        function renderFilter(filter) {
            var input, output;

            if (!(index % 2)) {
                input = renderTargetA.texture;
                output = renderTargetB;
            }
            else {
                input = renderTargetB.texture;
                output = renderTargetA;
            }

            if (!index) {
                input = inputTexture;
            }

            if (filter == lastFilter) {
                output = null;
            }

            if (filter.hidden) {
                basicMaterial.map = input;
                self.mesh.material = basicMaterial;
                self.tRenderer.render(self.scene, self.camera, output);
            }
            else {
                if (filter.material) {
                    self.mesh.material = filter.material;
                    filter.uniforms.inputImageTexture.value = input;

                    if (filter.uniforms.resolution) {
                        filter.uniforms.resolution.value = new THREE.Vector2(self.width, self.height);
                    }

                    self.tRenderer.render(self.scene, self.camera, output);
                    index ++;
                }
                else if (filter.render) {
                    filter.render(input, output);
                    index ++;
                }
                else if (filter.filters) {
                    filter.filters.forEach(renderFilter);
                }
            }
        }

        filters.forEach(renderFilter);
    }
}
