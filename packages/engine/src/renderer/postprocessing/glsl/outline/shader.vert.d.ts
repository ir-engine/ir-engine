declare const _default: "uniform float patternScale;\n\nvarying vec2 vUvPattern;\n\nvoid mainSupport(const in vec2 uv) {\n\n\tvUvPattern = uv * vec2(aspect, 1.0) * patternScale;\n\n}\n";
export default _default;
