declare const _default: "void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {\n\n\t#ifdef INVERTED\n\n\t\tvec3 color = vec3(1.0 - depth);\n\n\t#else\n\n\t\tvec3 color = vec3(depth);\n\n\t#endif\n\n\toutputColor = vec4(color, inputColor.a);\n\n}\n";
export default _default;
