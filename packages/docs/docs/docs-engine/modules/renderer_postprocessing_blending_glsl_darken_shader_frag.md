---
id: "renderer_postprocessing_blending_glsl_darken_shader_frag"
title: "Module: renderer/postprocessing/blending/glsl/darken/shader.frag"
sidebar_label: "renderer/postprocessing/blending/glsl/darken/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/blending/glsl/darken/shader.frag

## Properties

### default

• **default**: *vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	return min(x, y) * opacity + x * (1.0 - opacity);

}
*
