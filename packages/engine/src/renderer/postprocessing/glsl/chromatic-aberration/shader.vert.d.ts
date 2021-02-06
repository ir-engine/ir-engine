declare const _default: "uniform vec2 offset;\n\nvarying vec2 vUvR;\nvarying vec2 vUvB;\n\nvoid mainSupport(const in vec2 uv) {\n\n\tvUvR = uv + offset;\n\tvUvB = uv - offset;\n\n}\n";
export default _default;
