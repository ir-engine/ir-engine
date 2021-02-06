declare const _default: "float blend(const in float x, const in float y) {\n\n\treturn (y > 0.0) ? min(x / y, 1.0) : 1.0;\n\n}\n\nvec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {\n\n\tvec4 z = vec4(blend(x.r, y.r), blend(x.g, y.g), blend(x.b, y.b), blend(x.a, y.a));\n\n\treturn z * opacity + x * (1.0 - opacity);\n\n}\n";
export default _default;
