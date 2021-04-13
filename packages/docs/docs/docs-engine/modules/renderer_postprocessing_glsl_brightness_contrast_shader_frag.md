---
id: "renderer_postprocessing_glsl_brightness_contrast_shader_frag"
title: "Module: renderer/postprocessing/glsl/brightness-contrast/shader.frag"
sidebar_label: "renderer/postprocessing/glsl/brightness-contrast/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/brightness-contrast/shader.frag

## Properties

### default

• **default**: *uniform float brightness;
uniform float contrast;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec3 color = inputColor.rgb + vec3(brightness - 0.5);

	if(contrast > 0.0) {

		color /= vec3(1.0 - contrast);

	} else {

		color *= vec3(1.0 + contrast);

	}

	outputColor = vec4(min(color + vec3(0.5), 1.0), inputColor.a);

}
*
