---
id: "renderer_postprocessing_glsl_scanlines_shader_frag"
title: "Module: renderer/postprocessing/glsl/scanlines/shader.frag"
sidebar_label: "renderer/postprocessing/glsl/scanlines/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/scanlines/shader.frag

## Properties

### default

• **default**: *uniform float count;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec2 sl = vec2(sin(uv.y * count), cos(uv.y * count));
	vec3 scanlines = vec3(sl.x, sl.y, sl.x);

	outputColor = vec4(scanlines, inputColor.a);

}
*
