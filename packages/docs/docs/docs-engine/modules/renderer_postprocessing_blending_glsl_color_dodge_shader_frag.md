---
id: "renderer_postprocessing_blending_glsl_color_dodge_shader_frag"
title: "Module: renderer/postprocessing/blending/glsl/color-dodge/shader.frag"
sidebar_label: "renderer/postprocessing/blending/glsl/color-dodge/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/blending/glsl/color-dodge/shader.frag

## Properties

### default

• **default**: *float blend(const in float x, const in float y) {
	return (y == 1.0) ? y : min(x / (1.0 - y), 1.0);
}

vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {
	vec4 z = vec4(blend(x.r, y.r), blend(x.g, y.g), blend(x.b, y.b), blend(x.a, y.a));
	return z * opacity + x * (1.0 - opacity);
}*
