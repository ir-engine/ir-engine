declare const _default: "varying vec2 vUv;\n\nvoid main() {\n\n\tvUv = position.xy * 0.5 + 0.5;\n\tgl_Position = vec4(position.xy, 1.0, 1.0);\n\n}\n";
export default _default;
