---
id: "renderer_postprocessing_blending_glsl_negation_shader_frag"
title: "Module: renderer/postprocessing/blending/glsl/negation/shader.frag"
sidebar_label: "renderer/postprocessing/blending/glsl/negation/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/blending/glsl/negation/shader.frag

## Properties

### default

• **default**: *vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	return (1.0 - abs(1.0 - x - y)) * opacity + x * (1.0 - opacity);

}
*
