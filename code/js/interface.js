function Interface(renderer) {
    var self = this,
        controlsBox = document.getElementById('controls'),
        panelsBox = document.getElementById('panels'),

        //filtersBox = document.getElementById('filters'),

        photoButton = document.getElementById('photo-button'),
        recordButton = document.getElementById('record-button'),
    
        activeControl = null;

    self.updateSlider = function (control) {
        var value = control.value,
            min = control.min,
            max = control.max,
            percent = (value - min) / (max - min),
            controlsWidth = controlsBox.offsetWidth,

            text; //strength, size, speed

        control.innerLabel.style.width = controlsWidth;

        if (control.format) {
            text = control.format(control.value);
        }
        else if (control.labels) {
            text = control.name + ': ' + control.labels[control.value];
        }
        else {
            text = control.name + ': ' + control.value.toFixed(3);
        }

        control.innerLabel.innerHTML = text;
        control.outerLabel.innerHTML = text;

        control.inner.style.width = parseInt(percent*controlsWidth) + 'px';

        if (control.uniform) {
            control.parentFilter.uniforms[control.uniform].value = control.value;
        }

        if (control.disabled) {
            control.outer.style.opacity = .3;
        }
        else {
            control.outer.style.opacity = 1;
        }
    }

    function handleMouse(event) {
        var percent,
            newValue,
            mouseX = event.pageX;

        event.preventDefault();

        if (activeControl) {
            percent = (mouseX - activeControl.outer.offsetLeft) / activeControl.outer.offsetWidth;
            newValue = ((activeControl.max - activeControl.min) * percent) + activeControl.min;

            if (activeControl.step) {
                newValue = Math.round(newValue/activeControl.step) * activeControl.step;
            }

            if (newValue < activeControl.min) newValue = activeControl.min;
            else if (newValue > activeControl.max) newValue = activeControl.max;

            activeControl.value = newValue;

            self.updateSlider(activeControl);

            if (activeControl.onChange) {
                activeControl.onChange();
            }
        }
    };

    function addPanels() {
        panelsBox.innerHTML = '';

        renderer.filters.forEach(function (filter) {
            panelsBox.appendChild(filter.panel);
        });
    }

    function createPanels() {
        renderer.filters.forEach(function (filter) {
            var panel;

            if (filter.panel) {
                return;
            }

            panel = createElement('div', {className: 'panel'}),

            filter.panel = panel;

            if (!filter.controls) return;

            Object.keys(filter.controls).forEach(function (key) {
                var control = filter.controls[key],
                    element,
                    outer,
                    inner,
                    outerLabel,
                    innerLabel;

                control.name = key;
                element = createElement('div', {className: 'control'});

                if (control.type == 'slider') {
                    outer = createElement('div', {className: 'slider-outer'});
                    inner = createElement('div', {className: 'slider-inner'});
                    outerLabel = createElement('label');
                    innerLabel = createElement('label');

                    inner.appendChild(innerLabel);
                    outer.appendChild(outerLabel);

                    outer.appendChild(inner);
                    element.appendChild(outer);

                    control.outer = outer;
                    control.inner = inner;
                    control.innerLabel = innerLabel;
                    control.outerLabel = outerLabel;
                    control.parentFilter = filter;

                    self.updateSlider(control);

                    outer.addEventListener('mousedown', function (event) {
                        event.preventDefault();

                        if (control.disabled) return;

                        startMouseX = event.pageX;
                        startMouseY = event.pageY;
                        startValue = control.value;
                        activeControl = control;

                        handleMouse(event);
                    });
                }
                else if (control.type == 'button') {
                    inner = createElement('a', {className: 'button'});
                    inner.innerHTML = control.name;

                    inner.addEventListener('mousedown', function (event) {
                        event.preventDefault();
                    });
                    inner.addEventListener('click', function (event) {
                        event.preventDefault();

                        control.action();
                    });

                    element.appendChild(inner);
                }

                panel.appendChild(element);
            });
        });
    }

    function setupFilter() {
        var pair = Filters, //make a list if there is more effect
            filter = new pair[1](renderer);

        renderer.filters = [filter];

        createPanels();
        addPanels();

    }

/*
    function updateControlValues() {
        setInterval(function () {
            renderer.filters.forEach(function (filter) {
                if (filter.controls) {
                    Object.keys(filter.controls).forEach(function (key) {
                        var control = filter.controls[key];
                        if (control.type === 'slider') {
                            // Increment the value
                            control.value += 1; // Adjust the increment as needed
                            if (control.value > control.max) {
                                control.value = control.max;
                            }
                            // Apply the updated value to the effect
                            control.parentFilter.uniforms[control.uniform].value = control.value;
                        }
                    });
                }
            });
        }, 6000);
    }
    */

    createPanels();
    addPanels();
    //updateControlValues();

    setupFilter();

    document.addEventListener('mousemove', handleMouse);




    recordButton.addEventListener('click', function () {
            if (!recording) {
                console.log("recording");
                if (startRecording()) {
                    recordButton.style.color = '#f00';
                    return;
                }
            }
            else {
                console.log("finish recording");
                stopRecording();
            }

            recordButton.style.color = '#00f';
    });

    photoButton.addEventListener('click', function () {
        var url = renderer.tRenderer.domElement.toDataURL('image/png'),
            a = document.createElement('a');

            console.log("photo taken");
            a.href = url;
            a.download = 'DESY-' + '.png';
            a.click();
    });

}
