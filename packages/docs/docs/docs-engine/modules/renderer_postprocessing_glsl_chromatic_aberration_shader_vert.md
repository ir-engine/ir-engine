---
id: "renderer_postprocessing_glsl_chromatic_aberration_shader_vert"
title: "Module: renderer/postprocessing/glsl/chromatic-aberration/shader.vert"
sidebar_label: "renderer/postprocessing/glsl/chromatic-aberration/shader.vert"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/chromatic-aberration/shader.vert

## Properties

### default

• **default**: *uniform vec2 offset;

varying vec2 vUvR;
varying vec2 vUvB;

void mainSupport(const in vec2 uv) {

	vUvR = uv + offset;
	vUvB = uv - offset;

}
*
