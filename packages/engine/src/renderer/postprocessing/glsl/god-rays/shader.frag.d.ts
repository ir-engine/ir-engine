declare const _default: "uniform sampler2D texture;\n\nvoid mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {\n\n\toutputColor = texture2D(texture, uv);\n\n}\n";
export default _default;
