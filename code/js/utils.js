function createElement(tagName, properties) {
    var element = document.createElement(tagName),
        key;

    if (properties) {
        for (key in properties) {
            element[key] = properties[key];
        }
    }
    return element;
}

var BasicVertexShader = [
        "varying vec2 textureCoordinate;",

        "void main() {",
            "textureCoordinate = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
    ].join("\n");
