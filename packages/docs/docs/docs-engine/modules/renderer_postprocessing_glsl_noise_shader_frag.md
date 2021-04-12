---
id: "renderer_postprocessing_glsl_noise_shader_frag"
title: "Module: renderer/postprocessing/glsl/noise/shader.frag"
sidebar_label: "renderer/postprocessing/glsl/noise/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/noise/shader.frag

## Properties

### default

• **default**: *void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec3 noise = vec3(rand(uv * time));

	#ifdef PREMULTIPLY

		outputColor = vec4(min(inputColor.rgb * noise, vec3(1.0)), inputColor.a);

	#else

		outputColor = vec4(noise, inputColor.a);

	#endif

}
*
