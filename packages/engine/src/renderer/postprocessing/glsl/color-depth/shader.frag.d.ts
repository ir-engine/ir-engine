declare const _default: "uniform float factor;\n\nvoid mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {\n\n\toutputColor = vec4(floor(inputColor.rgb * factor + 0.5) / factor, inputColor.a);\n\n}\n";
export default _default;
