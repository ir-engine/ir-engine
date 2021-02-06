declare const _default: "vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {\n\treturn min(x + y, 1.0) * opacity + x * (1.0 - opacity);\n}";
export default _default;
