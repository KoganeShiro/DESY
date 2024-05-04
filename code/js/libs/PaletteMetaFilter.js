function PaletteMetaFilter(renderer) {
    var self = this,

        ditherFilter = new PatternDitherFilter(renderer),
        paletteFilter = new SimplePaletteFilter(renderer);

    self.name = "Palette Meta";

    self.controls = {
        "Dither Size": {
            type: 'slider',
            value: 1,
            min: 0,
            max: 10,
            step: 1,
            onChange: updateUniforms
        },
        Colors: {
            type: 'slider',
            value: 8,
            min: 2,
            max: 32,
            step: 1,
            onChange: setPalette
        },
        "Randomize Colors": {
            type: 'button',
            action: paletteFilter.controls['Randomize Colors'].action
        }
    };

    self.filters = [
        ditherFilter,
        paletteFilter
    ];

    function updateUniforms() {
        var ditherSize = self.controls['Dither Size'].value;

        if (!ditherSize) {
            ditherFilter.hidden = true;
        }
        else {
            ditherFilter.hidden = false;
            ditherFilter.uniforms.size.value = ditherSize;
        }
    }

    function setPalette() {
        paletteFilter.controls.Colors.value = self.controls.Colors.value;
        paletteFilter.controls.Colors.onChange();
    }
}
