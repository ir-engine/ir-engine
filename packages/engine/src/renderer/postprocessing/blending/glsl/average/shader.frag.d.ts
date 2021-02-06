declare const _default: "vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {\n\n\treturn (x + y) * 0.5 * opacity + x * (1.0 - opacity);\n\n}";
export default _default;
