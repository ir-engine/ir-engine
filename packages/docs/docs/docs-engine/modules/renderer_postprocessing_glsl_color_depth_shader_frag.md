---
id: "renderer_postprocessing_glsl_color_depth_shader_frag"
title: "Module: renderer/postprocessing/glsl/color-depth/shader.frag"
sidebar_label: "renderer/postprocessing/glsl/color-depth/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/color-depth/shader.frag

## Properties

### default

• **default**: *uniform float factor;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = vec4(floor(inputColor.rgb * factor + 0.5) / factor, inputColor.a);

}
*
