---
id: "renderer_postprocessing_glsl_tone_mapping_shader_frag"
title: "Module: renderer/postprocessing/glsl/tone-mapping/shader.frag"
sidebar_label: "renderer/postprocessing/glsl/tone-mapping/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/tone-mapping/shader.frag

## Properties

### default

• **default**: *uniform sampler2D luminanceMap;
uniform float middleGrey;
uniform float maxLuminance;
uniform float averageLuminance;

vec3 toneMap(vec3 c) {

	#ifdef ADAPTED_LUMINANCE

		// Get the calculated average luminance by sampling the center.
		float lumAvg = texture2D(luminanceMap, vec2(0.5)).r;

	#else

		float lumAvg = averageLuminance;

	#endif

	// Calculate the luminance of the current pixel.
	float lumPixel = linearToRelativeLuminance(c);

	// Apply the modified operator (Reinhard Eq. 4).
	float lumScaled = (lumPixel * middleGrey) / lumAvg;

	float lumCompressed = (lumScaled * (1.0 + (lumScaled / (maxLuminance * maxLuminance)))) / (1.0 + lumScaled);

	return lumCompressed * c;

}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = vec4(toneMap(inputColor.rgb), inputColor.a);

}
*
