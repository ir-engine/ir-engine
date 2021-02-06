declare const _default: "#ifdef ASPECT_CORRECTION\n\n\tuniform float scale;\n\n#else\n\n\tuniform mat3 uvTransform;\n\n#endif\n\nvarying vec2 vUv2;\n\nvoid mainSupport(const in vec2 uv) {\n\n\t#ifdef ASPECT_CORRECTION\n\n\t\tvUv2 = uv * vec2(aspect, 1.0) * scale;\n\n\t#else\n\n\t\tvUv2 = (uvTransform * vec3(uv, 1.0)).xy;\n\n\t#endif\n\n}\n";
export default _default;
