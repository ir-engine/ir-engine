---
id: "renderer_postprocessing_glsl_bloom_shader_frag"
title: "Module: renderer/postprocessing/glsl/bloom/shader.frag"
sidebar_label: "renderer/postprocessing/glsl/bloom/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/bloom/shader.frag

## Properties

### default

• **default**: *uniform sampler2D texture;
uniform float intensity;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = clamp(texture2D(texture, uv) * intensity, 0.0, 1.0);

}
*
