declare const _default: "void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {\n\n\tfloat sum = inputColor.r + inputColor.g + inputColor.b;\n\n\toutputColor = vec4(vec3(sum / 3.0), inputColor.a);\n\n}\n";
export default _default;
