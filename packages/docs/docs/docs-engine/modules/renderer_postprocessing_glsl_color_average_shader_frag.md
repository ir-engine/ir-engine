---
id: "renderer_postprocessing_glsl_color_average_shader_frag"
title: "Module: renderer/postprocessing/glsl/color-average/shader.frag"
sidebar_label: "renderer/postprocessing/glsl/color-average/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/color-average/shader.frag

## Properties

### default

• **default**: *void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	float sum = inputColor.r + inputColor.g + inputColor.b;

	outputColor = vec4(vec3(sum / 3.0), inputColor.a);

}
*
