declare const _default: "uniform float gamma;\n\nvoid mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {\n\n\toutputColor = LinearToGamma(max(inputColor, 0.0), gamma);\n\n}";
export default _default;
