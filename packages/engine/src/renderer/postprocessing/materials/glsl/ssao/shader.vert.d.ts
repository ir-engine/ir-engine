declare const _default: "uniform vec2 noiseScale;\n\nvarying vec2 vUv;\nvarying vec2 vUv2;\n\nvoid main() {\n\n\tvUv = position.xy * 0.5 + 0.5;\n\tvUv2 = vUv * noiseScale;\n\n\tgl_Position = vec4(position.xy, 1.0, 1.0);\n\n}\n";
export default _default;
