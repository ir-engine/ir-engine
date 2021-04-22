---
id: "renderer_postprocessing_glsl_grid_shader_frag"
title: "Module: renderer/postprocessing/glsl/grid/shader.frag"
sidebar_label: "renderer/postprocessing/glsl/grid/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/grid/shader.frag

## Properties

### default

• **default**: *uniform vec2 scale;
uniform float lineWidth;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	float grid = 0.5 - max(abs(mod(uv.x * scale.x, 1.0) - 0.5), abs(mod(uv.y * scale.y, 1.0) - 0.5));
	outputColor = vec4(vec3(smoothstep(0.0, lineWidth, grid)), inputColor.a);

}
*
