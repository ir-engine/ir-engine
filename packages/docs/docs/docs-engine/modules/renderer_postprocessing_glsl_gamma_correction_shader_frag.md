---
id: "renderer_postprocessing_glsl_gamma_correction_shader_frag"
title: "Module: renderer/postprocessing/glsl/gamma-correction/shader.frag"
sidebar_label: "renderer/postprocessing/glsl/gamma-correction/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/gamma-correction/shader.frag

## Properties

### default

• **default**: *uniform float gamma;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = LinearToGamma(max(inputColor, 0.0), gamma);

}*
