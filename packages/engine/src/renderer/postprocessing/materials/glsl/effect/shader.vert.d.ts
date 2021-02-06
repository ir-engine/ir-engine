declare const _default: "uniform vec2 resolution;\nuniform vec2 texelSize;\n\nuniform float cameraNear;\nuniform float cameraFar;\nuniform float aspect;\nuniform float time;\n\nvarying vec2 vUv;\n\nVERTEX_HEAD\n\nvoid main() {\n\n\tvUv = position.xy * 0.5 + 0.5;\n\n\tVERTEX_MAIN_SUPPORT\n\n\tgl_Position = vec4(position.xy, 1.0, 1.0);\n\n}\n";
export default _default;
