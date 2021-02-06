declare const _default: "vec3 blend(const in vec3 x, const in vec3 y, const in float opacity) {\n\n\treturn y * opacity + x * (1.0 - opacity);\n\n}\n\nvec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {\n\n\tfloat a = min(y.a, opacity);\n\n\treturn vec4(blend(x.rgb, y.rgb, a), max(x.a, a));\n\n}";
export default _default;
