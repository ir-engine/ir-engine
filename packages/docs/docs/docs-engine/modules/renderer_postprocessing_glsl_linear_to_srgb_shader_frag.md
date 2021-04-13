---
id: "renderer_postprocessing_glsl_linear_to_srgb_shader_frag"
title: "Module: renderer/postprocessing/glsl/linear-to-srgb/shader.frag"
sidebar_label: "renderer/postprocessing/glsl/linear-to-srgb/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/linear-to-srgb/shader.frag

## Properties

### default

• **default**: *void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = LinearTosRGB(max(inputColor, 0.0));

}*
