declare const _default: "uniform sampler2D texture;\nuniform float intensity;\n\nvoid mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {\n\n\toutputColor = clamp(texture2D(texture, uv) * intensity, 0.0, 1.0);\n\n}\n";
export default _default;
