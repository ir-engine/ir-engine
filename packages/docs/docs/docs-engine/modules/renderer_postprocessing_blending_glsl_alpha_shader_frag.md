---
id: "renderer_postprocessing_blending_glsl_alpha_shader_frag"
title: "Module: renderer/postprocessing/blending/glsl/alpha/shader.frag"
sidebar_label: "renderer/postprocessing/blending/glsl/alpha/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/blending/glsl/alpha/shader.frag

## Properties

### default

• **default**: *vec3 blend(const in vec3 x, const in vec3 y, const in float opacity) {

	return y * opacity + x * (1.0 - opacity);

}

vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	float a = min(y.a, opacity);

	return vec4(blend(x.rgb, y.rgb, a), max(x.a, a));

}*
