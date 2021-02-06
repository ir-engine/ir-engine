declare const _default: "uniform float count;\n\nvoid mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {\n\n\tvec2 sl = vec2(sin(uv.y * count), cos(uv.y * count));\n\tvec3 scanlines = vec3(sl.x, sl.y, sl.x);\n\n\toutputColor = vec4(scanlines, inputColor.a);\n\n}\n";
export default _default;
