---
id: "renderer_postprocessing_glsl_sepia_shader_frag"
title: "Module: renderer/postprocessing/glsl/sepia/shader.frag"
sidebar_label: "renderer/postprocessing/glsl/sepia/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/sepia/shader.frag

## Properties

### default

• **default**: *uniform float intensity;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec3 color = vec3(
		dot(inputColor.rgb, vec3(1.0 - 0.607 * intensity, 0.769 * intensity, 0.189 * intensity)),
		dot(inputColor.rgb, vec3(0.349 * intensity, 1.0 - 0.314 * intensity, 0.168 * intensity)),
		dot(inputColor.rgb, vec3(0.272 * intensity, 0.534 * intensity, 1.0 - 0.869 * intensity))
	);

	outputColor = vec4(color, inputColor.a);

}
*
