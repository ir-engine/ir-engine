---
id: "renderer_postprocessing_glsl_dot_screen_shader_frag"
title: "Module: renderer/postprocessing/glsl/dot-screen/shader.frag"
sidebar_label: "renderer/postprocessing/glsl/dot-screen/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/dot-screen/shader.frag

## Properties

### default

• **default**: *uniform vec2 angle;
uniform float scale;

float pattern(const in vec2 uv) {

	vec2 point = scale * vec2(
		dot(angle.yx, vec2(uv.x, -uv.y)),
		dot(angle, uv)
	);

	return (sin(point.x) * sin(point.y)) * 4.0;

}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec3 color = vec3(inputColor.rgb * 10.0 - 5.0 + pattern(uv * resolution));
	outputColor = vec4(color, inputColor.a);

}
*
