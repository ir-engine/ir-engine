declare const _default: "uniform bool active;\nuniform vec2 d;\n\nvoid mainUv(inout vec2 uv) {\n\n\tif(active) {\n\n\t\tuv = vec2(\n\t\t\td.x * (floor(uv.x / d.x) + 0.5),\n\t\t\td.y * (floor(uv.y / d.y) + 0.5)\n\t\t);\n\n\t}\n\n}\n";
export default _default;
