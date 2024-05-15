var FlipShader = [
    "varying vec2 textureCoordinate;",
    "",
    "uniform sampler2D inputImageTexture;",
    "",
    "void main() {",
    "    vec2 xy = textureCoordinate;",
    "",
    "    xy.x = 1.0 - xy.x;",
    "",
    "    gl_FragColor = texture2D(inputImageTexture, xy);",
    "}",
    ""
].join('\n');