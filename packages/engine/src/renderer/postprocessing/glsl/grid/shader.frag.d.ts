declare const _default: "uniform vec2 scale;\nuniform float lineWidth;\n\nvoid mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {\n\n\tfloat grid = 0.5 - max(abs(mod(uv.x * scale.x, 1.0) - 0.5), abs(mod(uv.y * scale.y, 1.0) - 0.5));\n\toutputColor = vec4(vec3(smoothstep(0.0, lineWidth, grid)), inputColor.a);\n\n}\n";
export default _default;
