---
id: "renderer_postprocessing_glsl_texture_shader_frag"
title: "Module: renderer/postprocessing/glsl/texture/shader.frag"
sidebar_label: "renderer/postprocessing/glsl/texture/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/texture/shader.frag

## Properties

### default

• **default**: *uniform sampler2D texture;

#if defined(ASPECT_CORRECTION) || defined(UV_TRANSFORM)

	varying vec2 vUv2;

#endif

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	#if defined(ASPECT_CORRECTION) || defined(UV_TRANSFORM)

		vec4 texel = texelToLinear(texture2D(texture, vUv2));

	#else

		vec4 texel = texelToLinear(texture2D(texture, uv));

	#endif

	outputColor = TEXEL;

}
*
