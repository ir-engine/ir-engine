declare const _default: "float blend(const in float x, const in float y) {\n\treturn (y == 1.0) ? y : min(x / (1.0 - y), 1.0);\n}\n\nvec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {\n\tvec4 z = vec4(blend(x.r, y.r), blend(x.g, y.g), blend(x.b, y.b), blend(x.a, y.a));\n\treturn z * opacity + x * (1.0 - opacity);\n}";
export default _default;
