---
id: "renderer_postprocessing_glsl_chromatic_aberration_shader_frag"
title: "Module: renderer/postprocessing/glsl/chromatic-aberration/shader.frag"
sidebar_label: "renderer/postprocessing/glsl/chromatic-aberration/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/chromatic-aberration/shader.frag

## Properties

### default

• **default**: *varying vec2 vUvR;
varying vec2 vUvB;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec4 color = inputColor;

	#ifdef ALPHA

		vec2 ra = texture2D(inputBuffer, vUvR).ra;
		vec2 ba = texture2D(inputBuffer, vUvB).ba;

		color.r = ra.x;
		color.b = ba.x;
		color.a = max(max(ra.y, ba.y), inputColor.a);

	#else

		color.r = texture2D(inputBuffer, vUvR).r;
		color.b = texture2D(inputBuffer, vUvB).b;

	#endif

	outputColor = color;

}
*
