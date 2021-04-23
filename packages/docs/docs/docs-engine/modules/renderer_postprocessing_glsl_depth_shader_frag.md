---
id: "renderer_postprocessing_glsl_depth_shader_frag"
title: "Module: renderer/postprocessing/glsl/depth/shader.frag"
sidebar_label: "renderer/postprocessing/glsl/depth/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/depth/shader.frag

## Properties

### default

• **default**: *void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {

	#ifdef INVERTED

		vec3 color = vec3(1.0 - depth);

	#else

		vec3 color = vec3(depth);

	#endif

	outputColor = vec4(color, inputColor.a);

}
*
