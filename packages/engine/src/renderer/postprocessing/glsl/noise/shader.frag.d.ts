declare const _default: "void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {\n\n\tvec3 noise = vec3(rand(uv * time));\n\n\t#ifdef PREMULTIPLY\n\n\t\toutputColor = vec4(min(inputColor.rgb * noise, vec3(1.0)), inputColor.a);\n\n\t#else\n\n\t\toutputColor = vec4(noise, inputColor.a);\n\n\t#endif\n\n}\n";
export default _default;
